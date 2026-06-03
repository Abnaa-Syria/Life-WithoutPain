const prisma = require('../../config/database');
const { ROLES, USER_ROLE_ENUM, ADMIN_ROLES } = require('../../constants');
const { NotFoundError, ForbiddenError, BadRequestError } = require('../../shared/errors/AppError');
const { createAuditLog } = require('../../middlewares/auditLog');
const { getEffectivePermissions } = require('./permission.service');

class RbacService {
  static async listRoles() {
    return prisma.role.findMany({
      orderBy: { name: 'asc' },
      include: {
        permissions: { include: { permission: true } },
        _count: { select: { permissions: true } },
      },
    });
  }

  static async listPermissions() {
    return prisma.permission.findMany({ orderBy: [{ module: 'asc' }, { name: 'asc' }] });
  }

  static async listAssignableRoles() {
    return prisma.role.findMany({
      where: { name: { in: ADMIN_ROLES } },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        displayName: true,
        description: true,
        isSystem: true,
      },
    });
  }

  static async getRoleById(roleId) {
    const role = await this.getRoleWithPermissions(roleId);
    if (!role) throw new NotFoundError('ROLE_NOT_FOUND');
    return role;
  }

  static normalizeRoleName(name) {
    return String(name || '')
      .trim()
      .toUpperCase()
      .replace(/\s+/g, '_')
      .replace(/[^A-Z0-9_]/g, '');
  }

  static async createRole(data, actorId, req) {
    const name = RbacService.normalizeRoleName(data.name);
    if (!name || name.length < 2) {
      throw new BadRequestError('ROLE_NAME_TOO_SHORT');
    }

    const existing = await prisma.role.findUnique({ where: { name } });
    if (existing) throw new BadRequestError('ROLE_NAME_EXISTS');

    const role = await prisma.role.create({
      data: {
        name,
        displayName: data.displayName,
        description: data.description,
        isSystem: false,
      },
    });
    createAuditLog({ actorId, entityType: 'Role', entityId: role.id, action: 'CREATE', newValues: { ...data, name }, req });
    return role;
  }

  static async updateRole(roleId, data, actorId, req) {
    const role = await prisma.role.findUnique({ where: { id: roleId } });
    if (!role) throw new NotFoundError('ROLE_NOT_FOUND');
    if (role.isSystem && data.name && data.name !== role.name) {
      throw new ForbiddenError('SYSTEM_ROLE_NAME_LOCKED');
    }

    const updated = await prisma.role.update({
      where: { id: roleId },
      data: {
        displayName: data.displayName,
        description: data.description,
        ...(data.name && !role.isSystem ? { name: data.name } : {}),
      },
    });
    createAuditLog({ actorId, entityType: 'Role', entityId: roleId, action: 'UPDATE', newValues: data, req });
    return updated;
  }

  static async deleteRole(roleId, actorId, req) {
    const role = await prisma.role.findUnique({ where: { id: roleId } });
    if (!role) throw new NotFoundError('ROLE_NOT_FOUND');
    if (role.isSystem) throw new ForbiddenError('SYSTEM_ROLE_DELETE_FORBIDDEN');

    await prisma.role.delete({ where: { id: roleId } });
    createAuditLog({ actorId, entityType: 'Role', entityId: roleId, action: 'DELETE', req });
    return { deleted: true };
  }

  static async setRolePermissions(roleId, permissionIds, actorId, req) {
    const role = await prisma.role.findUnique({ where: { id: roleId } });
    if (!role) throw new NotFoundError('ROLE_NOT_FOUND');
    if (role.name === ROLES.SUPER_ADMIN) {
      throw new ForbiddenError('SUPER_ADMIN_PERMISSIONS_LOCKED');
    }

    await prisma.$transaction(async (tx) => {
      await tx.rolePermission.deleteMany({ where: { roleId } });
      if (permissionIds.length) {
        await tx.rolePermission.createMany({
          data: permissionIds.map((permissionId) => ({ roleId, permissionId })),
        });
      }
    });

    createAuditLog({
      actorId,
      entityType: 'Role',
      entityId: roleId,
      action: 'UPDATE',
      newValues: { permissionIds },
      req,
    });

    return this.getRoleWithPermissions(roleId);
  }

  static async getRoleWithPermissions(roleId) {
    return prisma.role.findUnique({
      where: { id: roleId },
      include: { permissions: { include: { permission: true } } },
    });
  }

  static async assignUserRole(userId, roleName, actorId, req) {
    const normalizedRole = RbacService.normalizeRoleName(roleName);
    if (!USER_ROLE_ENUM.includes(normalizedRole)) {
      throw new BadRequestError('RBAC_ROLE_NOT_IN_ENUM', { role: normalizedRole });
    }

    const dbRole = await prisma.role.findUnique({ where: { name: normalizedRole } });
    if (!dbRole) {
      throw new BadRequestError('RBAC_ROLE_UNDEFINED', { role: normalizedRole });
    }

    if (actorId === userId && normalizedRole !== ROLES.SUPER_ADMIN) {
      const actorPerms = await getEffectivePermissions(actorId);
      if (!actorPerms.includes('roles.manage')) {
        throw new ForbiddenError('CANNOT_CHANGE_OWN_ROLE');
      }
    }

    const superAdminCount = await prisma.user.count({
      where: { role: ROLES.SUPER_ADMIN, deletedAt: null, status: 'ACTIVE' },
    });
    const target = await prisma.user.findUnique({ where: { id: userId } });
    if (!target) throw new NotFoundError('USER_NOT_FOUND');

    if (target.role === ROLES.SUPER_ADMIN && normalizedRole !== ROLES.SUPER_ADMIN && superAdminCount <= 1) {
      throw new ForbiddenError('LAST_SUPER_ADMIN');
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { role: normalizedRole },
      select: { id: true, fullName: true, email: true, role: true, status: true },
    });

    createAuditLog({ actorId, entityType: 'User', entityId: userId, action: 'UPDATE', newValues: { role: normalizedRole }, req });
    return updated;
  }

  static async setUserPermissionOverrides(userId, overrides, actorId, req) {
    if (actorId === userId) {
      const deniesManage = overrides.some((o) => o.permissionName === 'roles.manage' && o.granted === false);
      if (deniesManage) throw new ForbiddenError('CANNOT_REVOKE_OWN_ROLES_MANAGE');
    }

    await prisma.$transaction(async (tx) => {
      await tx.userPermission.deleteMany({ where: { userId } });
      for (const item of overrides) {
        const perm = await tx.permission.findUnique({ where: { name: item.permissionName } });
        if (!perm) continue;
        await tx.userPermission.create({
          data: { userId, permissionId: perm.id, granted: item.granted !== false },
        });
      }
    });

    createAuditLog({
      actorId,
      entityType: 'User',
      entityId: userId,
      action: 'UPDATE',
      newValues: { permissionOverrides: overrides },
      req,
    });

    const permissions = await getEffectivePermissions(userId);
    return { userId, permissions };
  }
}

module.exports = RbacService;

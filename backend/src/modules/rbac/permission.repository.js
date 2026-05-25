const prisma = require('../../config/database');

class PermissionRepository {
  static async findRoleByName(name) {
    return prisma.role.findUnique({
      where: { name },
      include: {
        permissions: {
          include: { permission: true },
        },
      },
    });
  }

  static async findAllPermissionNames() {
    const rows = await prisma.permission.findMany({ select: { name: true } });
    return rows.map((r) => r.name);
  }

  static async findUserPermissionOverrides(userId) {
    return prisma.userPermission.findMany({
      where: { userId },
      include: { permission: true },
    });
  }
}

module.exports = PermissionRepository;

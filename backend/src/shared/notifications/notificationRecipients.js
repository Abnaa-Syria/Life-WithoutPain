const prisma = require('../../config/database');
const { ROLES, STAFF_ROLES } = require('../../constants');
const { getEffectivePermissions, hasPermission } = require('../../modules/rbac/permission.service');
const { permissionForNotificationType } = require('./notificationPermissions');

/**
 * Active dashboard staff user IDs that hold a given permission.
 */
async function getStaffUserIdsWithPermission(permissionName) {
  if (!permissionName) return [];

  const users = await prisma.user.findMany({
    where: {
      status: 'ACTIVE',
      deletedAt: null,
      role: { in: STAFF_ROLES },
    },
    select: { id: true, role: true },
  });

  const ids = [];
  for (const user of users) {
    const permissions = await getEffectivePermissions(user.id, user.role);
    if (hasPermission(permissions, permissionName)) {
      ids.push(user.id);
    }
  }
  return [...new Set(ids)];
}

async function getStaffUserIdsForNotificationType(type) {
  const permission = permissionForNotificationType(type);
  return getStaffUserIdsWithPermission(permission);
}

async function getSuperAdminUserIds() {
  const users = await prisma.user.findMany({
    where: {
      role: ROLES.SUPER_ADMIN,
      status: 'ACTIVE',
      deletedAt: null,
    },
    select: { id: true },
  });
  return users.map((u) => u.id);
}

module.exports = {
  getStaffUserIdsWithPermission,
  getStaffUserIdsForNotificationType,
  getSuperAdminUserIds,
};

const { ROLES } = require('../../constants');
const {
  PERMISSION_CATALOG,
  getPermissionsForRole,
} = require('../../shared/permissions/catalog');
const PermissionRepository = require('./permission.repository');
const prisma = require('../../config/database');

const LEGACY_FALLBACK = process.env.RBAC_LEGACY_FALLBACK !== 'false';

/**
 * Resolve effective permission names for a user.
 * DENY (granted: false) wins over role grants and explicit grants.
 */
async function getEffectivePermissions(userId, userRole) {
  const role = userRole ?? (await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  }))?.role;

  if (!role) return [];

  if (role === ROLES.SUPER_ADMIN) {
    const all = await PermissionRepository.findAllPermissionNames();
    if (all.length > 0) return all;
    if (LEGACY_FALLBACK) return Object.keys(PERMISSION_CATALOG);
    return [];
  }

  const effective = new Set();

  const dbRole = await PermissionRepository.findRoleByName(role);
  if (dbRole?.permissions?.length) {
    for (const rp of dbRole.permissions) {
      effective.add(rp.permission.name);
    }
  } else if (LEGACY_FALLBACK) {
    for (const key of getPermissionsForRole(role)) {
      effective.add(key);
    }
  }

  const overrides = await PermissionRepository.findUserPermissionOverrides(userId);
  const grants = [];
  const denials = [];

  for (const up of overrides) {
    if (up.granted) grants.push(up.permission.name);
    else denials.push(up.permission.name);
  }

  for (const g of grants) effective.add(g);
  for (const d of denials) effective.delete(d);

  return Array.from(effective).sort();
}

function hasPermission(permissionSet, permission) {
  if (!permission) return false;
  if (Array.isArray(permissionSet)) return permissionSet.includes(permission);
  if (permissionSet instanceof Set) return permissionSet.has(permission);
  return false;
}

module.exports = {
  getEffectivePermissions,
  hasPermission,
};

const { requirePermissionOrLegacy } = require('../../middlewares/requirePermission');
const { ROLES, ADMIN_ROLES } = require('../../constants');

const MEDICAL = [ROLES.SUPER_ADMIN, ROLES.MEDICAL_ADMIN];
const SUPPORT = [ROLES.SUPER_ADMIN, ROLES.SUPPORT_STAFF];
const INSURANCE = [ROLES.SUPER_ADMIN, ROLES.INSURANCE_STAFF, ROLES.MEDICAL_ADMIN];
const FINANCE = [ROLES.SUPER_ADMIN, ROLES.ACCOUNTANT];
const SUPER = [ROLES.SUPER_ADMIN];

/** Shorthand: requirePermissionOrLegacy(perm, ...legacyRoles) */
const guard = (permission, legacyRoles = ADMIN_ROLES) =>
  requirePermissionOrLegacy(permission, ...legacyRoles);

module.exports = {
  guard,
  MEDICAL,
  SUPPORT,
  INSURANCE,
  FINANCE,
  SUPER,
  ADMIN_ROLES,
};

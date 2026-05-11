const { ROLES } = require('../../constants');
const { ForbiddenError, UnauthorizedError } = require('../errors/AppError');

const PERMISSIONS = {
  'users.list': [ROLES.SUPER_ADMIN, ROLES.MEDICAL_ADMIN],
  'users.read': [ROLES.SUPER_ADMIN, ROLES.MEDICAL_ADMIN],
  'users.create': [ROLES.SUPER_ADMIN],
  'users.update': [ROLES.SUPER_ADMIN],
  'users.delete': [ROLES.SUPER_ADMIN],

  'patients.list': [ROLES.SUPER_ADMIN, ROLES.MEDICAL_ADMIN, ROLES.SUPPORT_STAFF],
  'patients.read': [ROLES.SUPER_ADMIN, ROLES.MEDICAL_ADMIN, ROLES.SUPPORT_STAFF, ROLES.DOCTOR],
  'patients.update': [ROLES.SUPER_ADMIN, ROLES.MEDICAL_ADMIN],
  'patients.delete': [ROLES.SUPER_ADMIN],

  'doctors.list': [ROLES.SUPER_ADMIN, ROLES.MEDICAL_ADMIN],
  'doctors.read': [ROLES.SUPER_ADMIN, ROLES.MEDICAL_ADMIN],
  'doctors.verify': [ROLES.SUPER_ADMIN, ROLES.MEDICAL_ADMIN],

  'specialities.create': [ROLES.SUPER_ADMIN, ROLES.MEDICAL_ADMIN],
  'specialities.update': [ROLES.SUPER_ADMIN, ROLES.MEDICAL_ADMIN],
  'specialities.delete': [ROLES.SUPER_ADMIN],

  'services.create': [ROLES.SUPER_ADMIN, ROLES.MEDICAL_ADMIN],
  'services.update': [ROLES.SUPER_ADMIN, ROLES.MEDICAL_ADMIN],
  'services.delete': [ROLES.SUPER_ADMIN],

  'appointments.list': [ROLES.SUPER_ADMIN, ROLES.MEDICAL_ADMIN],
  'appointments.read': [ROLES.SUPER_ADMIN, ROLES.MEDICAL_ADMIN, ROLES.SUPPORT_STAFF],
  'appointments.update': [ROLES.SUPER_ADMIN, ROLES.MEDICAL_ADMIN],
  'appointments.delete': [ROLES.SUPER_ADMIN],

  'insurance.cases.list': [ROLES.SUPER_ADMIN, ROLES.MEDICAL_ADMIN, ROLES.INSURANCE_STAFF],
  'insurance.cases.read': [ROLES.SUPER_ADMIN, ROLES.MEDICAL_ADMIN, ROLES.INSURANCE_STAFF],
  'insurance.cases.decide': [ROLES.SUPER_ADMIN, ROLES.INSURANCE_STAFF],
  'insurance.providers.manage': [ROLES.SUPER_ADMIN],

  'support.cases.list': [ROLES.SUPER_ADMIN, ROLES.SUPPORT_STAFF],
  'support.cases.read': [ROLES.SUPER_ADMIN, ROLES.SUPPORT_STAFF],
  'support.cases.manage': [ROLES.SUPER_ADMIN, ROLES.SUPPORT_STAFF],

  'claims.list': [ROLES.SUPER_ADMIN, ROLES.ACCOUNTANT],
  'claims.manage': [ROLES.SUPER_ADMIN, ROLES.ACCOUNTANT],
  'reconciliations.manage': [ROLES.SUPER_ADMIN, ROLES.ACCOUNTANT],
  'payouts.manage': [ROLES.SUPER_ADMIN, ROLES.ACCOUNTANT],

  'payments.list': [ROLES.SUPER_ADMIN, ROLES.ACCOUNTANT],
  'payments.read': [ROLES.SUPER_ADMIN, ROLES.ACCOUNTANT],

  'reports.admin.list': [ROLES.SUPER_ADMIN, ROLES.MEDICAL_ADMIN],
  'prescriptions.admin.list': [ROLES.SUPER_ADMIN, ROLES.MEDICAL_ADMIN],

  'notifications.admin.send': [ROLES.SUPER_ADMIN],
  'notifications.admin.manage': [ROLES.SUPER_ADMIN],

  'reviews.moderate': [ROLES.SUPER_ADMIN, ROLES.MEDICAL_ADMIN],

  'settings.manage': [ROLES.SUPER_ADMIN],
  'audit.view': [ROLES.SUPER_ADMIN],
  'roles.manage': [ROLES.SUPER_ADMIN],
};

const hasPermission = (userRole, permission) => {
  const allowedRoles = PERMISSIONS[permission];
  if (!allowedRoles) return false;
  return allowedRoles.includes(userRole);
};

const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }
    if (!hasPermission(req.user.role, permission)) {
      return next(new ForbiddenError('You do not have permission to perform this action'));
    }
    next();
  };
};

module.exports = { PERMISSIONS, hasPermission, requirePermission };

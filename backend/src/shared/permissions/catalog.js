const { ROLES } = require('../../constants');

/**
 * Canonical permission catalog — single source for seeds and documentation.
 * Keys are permission names stored in DB. Values are allowed UserRole enum names.
 */
const PERMISSION_CATALOG = {
  'users.list': [ROLES.SUPER_ADMIN, ROLES.MEDICAL_ADMIN],
  'users.read': [ROLES.SUPER_ADMIN, ROLES.MEDICAL_ADMIN],
  'users.create': [ROLES.SUPER_ADMIN],
  'users.update': [ROLES.SUPER_ADMIN],
  'users.delete': [ROLES.SUPER_ADMIN],

  'patients.list': [ROLES.SUPER_ADMIN, ROLES.MEDICAL_ADMIN, ROLES.SUPPORT_STAFF],
  'patients.read': [ROLES.SUPER_ADMIN, ROLES.MEDICAL_ADMIN, ROLES.SUPPORT_STAFF, ROLES.DOCTOR],
  'patients.update': [ROLES.SUPER_ADMIN, ROLES.MEDICAL_ADMIN],
  'patients.delete': [ROLES.SUPER_ADMIN],
  'patients.insurance.read': [ROLES.SUPER_ADMIN, ROLES.MEDICAL_ADMIN, ROLES.INSURANCE_STAFF, ROLES.SUPPORT_STAFF],
  'patients.insurance.verify': [ROLES.SUPER_ADMIN, ROLES.INSURANCE_STAFF],

  'doctors.list': [ROLES.SUPER_ADMIN, ROLES.MEDICAL_ADMIN],
  'doctors.read': [ROLES.SUPER_ADMIN, ROLES.MEDICAL_ADMIN],
  'doctors.update': [ROLES.SUPER_ADMIN, ROLES.MEDICAL_ADMIN],
  'doctors.delete': [ROLES.SUPER_ADMIN],
  'doctors.verify': [ROLES.SUPER_ADMIN, ROLES.MEDICAL_ADMIN],

  'specialities.list': [ROLES.SUPER_ADMIN, ROLES.MEDICAL_ADMIN],
  'specialities.read': [ROLES.SUPER_ADMIN, ROLES.MEDICAL_ADMIN],
  'specialities.create': [ROLES.SUPER_ADMIN, ROLES.MEDICAL_ADMIN],
  'specialities.update': [ROLES.SUPER_ADMIN, ROLES.MEDICAL_ADMIN],
  'specialities.delete': [ROLES.SUPER_ADMIN],

  'services.list': [ROLES.SUPER_ADMIN, ROLES.MEDICAL_ADMIN],
  'services.read': [ROLES.SUPER_ADMIN, ROLES.MEDICAL_ADMIN],
  'services.create': [ROLES.SUPER_ADMIN, ROLES.MEDICAL_ADMIN],
  'services.update': [ROLES.SUPER_ADMIN, ROLES.MEDICAL_ADMIN],
  'services.delete': [ROLES.SUPER_ADMIN],

  'appointments.list': [ROLES.SUPER_ADMIN, ROLES.MEDICAL_ADMIN],
  'appointments.read': [ROLES.SUPER_ADMIN, ROLES.MEDICAL_ADMIN, ROLES.SUPPORT_STAFF],
  'appointments.update': [ROLES.SUPER_ADMIN, ROLES.MEDICAL_ADMIN],
  'appointments.delete': [ROLES.SUPER_ADMIN],

  'insurance.cases.list': [ROLES.SUPER_ADMIN, ROLES.MEDICAL_ADMIN, ROLES.INSURANCE_STAFF],
  'insurance.cases.read': [ROLES.SUPER_ADMIN, ROLES.MEDICAL_ADMIN, ROLES.INSURANCE_STAFF],
  'insurance.cases.update': [ROLES.SUPER_ADMIN, ROLES.INSURANCE_STAFF, ROLES.MEDICAL_ADMIN],
  'insurance.cases.delete': [ROLES.SUPER_ADMIN, ROLES.INSURANCE_STAFF],
  'insurance.cases.decide': [ROLES.SUPER_ADMIN, ROLES.INSURANCE_STAFF],
  'insurance.providers.manage': [ROLES.SUPER_ADMIN],

  'support.cases.list': [ROLES.SUPER_ADMIN, ROLES.SUPPORT_STAFF],
  'support.cases.read': [ROLES.SUPER_ADMIN, ROLES.SUPPORT_STAFF],
  'support.cases.manage': [ROLES.SUPER_ADMIN, ROLES.SUPPORT_STAFF],

  'support.tickets.list': [ROLES.SUPER_ADMIN, ROLES.SUPPORT_STAFF],
  'support.tickets.read': [ROLES.SUPER_ADMIN, ROLES.SUPPORT_STAFF],
  'support.tickets.manage': [ROLES.SUPER_ADMIN, ROLES.SUPPORT_STAFF],
  'support.tickets.info': [ROLES.SUPER_ADMIN],

  'claims.list': [ROLES.SUPER_ADMIN, ROLES.ACCOUNTANT],
  'claims.manage': [ROLES.SUPER_ADMIN, ROLES.ACCOUNTANT],
  'reconciliations.manage': [ROLES.SUPER_ADMIN, ROLES.ACCOUNTANT],
  'payouts.manage': [ROLES.SUPER_ADMIN, ROLES.ACCOUNTANT],

  'payments.list': [ROLES.SUPER_ADMIN, ROLES.ACCOUNTANT],
  'payments.read': [ROLES.SUPER_ADMIN, ROLES.ACCOUNTANT],
  'payments.update': [ROLES.SUPER_ADMIN, ROLES.ACCOUNTANT],
  'payments.delete': [ROLES.SUPER_ADMIN],

  'reports.admin.list': [ROLES.SUPER_ADMIN, ROLES.MEDICAL_ADMIN],
  'reports.admin.update': [ROLES.SUPER_ADMIN, ROLES.MEDICAL_ADMIN],
  'reports.admin.delete': [ROLES.SUPER_ADMIN],

  'prescriptions.admin.list': [ROLES.SUPER_ADMIN, ROLES.MEDICAL_ADMIN],
  'prescriptions.admin.update': [ROLES.SUPER_ADMIN, ROLES.MEDICAL_ADMIN],
  'prescriptions.admin.delete': [ROLES.SUPER_ADMIN],

  'notifications.admin.send': [ROLES.SUPER_ADMIN],
  'notifications.admin.manage': [ROLES.SUPER_ADMIN],

  'reviews.moderate': [ROLES.SUPER_ADMIN, ROLES.MEDICAL_ADMIN],

  'settings.manage': [ROLES.SUPER_ADMIN],
  'audit.view': [ROLES.SUPER_ADMIN],
  'roles.manage': [ROLES.SUPER_ADMIN],

  'lab-tests.list': [ROLES.SUPER_ADMIN, ROLES.MEDICAL_ADMIN],
  'lab-tests.read': [ROLES.SUPER_ADMIN, ROLES.MEDICAL_ADMIN],
  'lab-tests.update': [ROLES.SUPER_ADMIN, ROLES.MEDICAL_ADMIN],
  'lab-tests.delete': [ROLES.SUPER_ADMIN],

  'medical-master.list': [ROLES.SUPER_ADMIN, ROLES.MEDICAL_ADMIN],
  'medical-master.create': [ROLES.SUPER_ADMIN, ROLES.MEDICAL_ADMIN],
  'medical-master.update': [ROLES.SUPER_ADMIN, ROLES.MEDICAL_ADMIN],
  'medical-master.delete': [ROLES.SUPER_ADMIN],

  'dashboard.view': [
    ROLES.SUPER_ADMIN,
    ROLES.MEDICAL_ADMIN,
    ROLES.INSURANCE_STAFF,
    ROLES.SUPPORT_STAFF,
    ROLES.ACCOUNTANT,
  ],
};

/**
 * Seeded system roles (names must match UserRole enum).
 * MEDICAL_INSURANCE_AGENT and similar roles are added by other workflows — use
 * RBAC_EXTRA_SYSTEM_ROLES env at seed time once the enum exists.
 */
const SYSTEM_ROLES = [
  { name: ROLES.SUPER_ADMIN, displayName: 'Super Admin', description: 'Full system access' },
  { name: ROLES.MEDICAL_ADMIN, displayName: 'Medical Admin', description: 'Medical operations administration' },
  { name: ROLES.INSURANCE_STAFF, displayName: 'Insurance Staff', description: 'Insurance case management' },
  { name: ROLES.SUPPORT_STAFF, displayName: 'Support Staff', description: 'Customer support operations' },
  { name: ROLES.ACCOUNTANT, displayName: 'Accountant', description: 'Finance and accounting' },
  { name: ROLES.PATIENT, displayName: 'Patient', description: 'Patient mobile app user' },
  { name: ROLES.DOCTOR, displayName: 'Doctor', description: 'Doctor mobile app user' },
];

function parsePermissionName(name) {
  const parts = name.split('.');
  if (parts.length < 2) {
    return { module: name, action: 'access' };
  }
  const action = parts.pop();
  const module = parts.join('.');
  return { module, action };
}

function getPermissionsForRole(roleName) {
  if (roleName === ROLES.SUPER_ADMIN) {
    return Object.keys(PERMISSION_CATALOG);
  }
  return Object.entries(PERMISSION_CATALOG)
    .filter(([, roles]) => roles.includes(roleName))
    .map(([key]) => key);
}

module.exports = {
  PERMISSION_CATALOG,
  SYSTEM_ROLES,
  parsePermissionName,
  getPermissionsForRole,
};

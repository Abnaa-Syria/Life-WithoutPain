/** Route/nav permission keys — must match backend catalog */

export const ROUTE_PERMISSIONS = {
  dashboard: 'dashboard.view',
  users: 'users.list',
  patients: 'patients.list',
  doctors: 'doctors.list',
  specialities: 'specialities.list',
  services: 'services.list',
  medicalMaster: 'medical-master.list',
  appointments: 'appointments.list',
  insurance: 'insurance.cases.list',
  insuranceDecide: 'insurance.cases.decide',
  patientsInsurance: 'patients.insurance.read',
  patientsInsuranceVerify: 'patients.insurance.verify',
  claims: 'claims.list',
  payments: 'payments.list',
  reconciliations: 'reconciliations.manage',
  payouts: 'payouts.manage',
  reports: 'reports.admin.list',
  prescriptions: 'prescriptions.admin.list',
  support: 'support.tickets.list',
  notifications: 'notifications.admin.manage',
  reviews: 'reviews.moderate',
  audit: 'audit.view',
  settings: 'settings.manage',
  roles: 'roles.manage',
};

export function hasPermission(permissions, key) {
  if (!key) return true;
  if (!permissions?.length) return false;
  return permissions.includes(key);
}

export function hasAnyPermission(permissions, keys) {
  if (!keys?.length) return true;
  return keys.some((k) => hasPermission(permissions, k));
}

export function hasAllPermissions(permissions, keys) {
  if (!keys?.length) return true;
  return keys.every((k) => hasPermission(permissions, k));
}

/** Permission-first with optional legacy role fallback */
export function canAccess({ permissions, role }, { permission, permissions: anyOf, roles }) {
  if (permission && hasPermission(permissions, permission)) return true;
  if (anyOf?.length && hasAnyPermission(permissions, anyOf)) return true;
  if (roles?.length && role && roles.includes(role)) return true;
  if (!permission && !anyOf?.length && !roles?.length) return true;
  return false;
}

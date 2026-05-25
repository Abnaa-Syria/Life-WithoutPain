/**
 * Authorization matrix smoke tests (catalog + role mapping).
 * Run: npm run test:rbac (includes permission.service.test.js)
 * Full HTTP matrix requires running server + seeded DB.
 */
const assert = require('assert');
const { getPermissionsForRole } = require('../../src/shared/permissions/catalog');
const { ROLES } = require('../../src/constants');

const MATRIX = [
  { role: ROLES.SUPER_ADMIN, endpoint: 'users.create', expect: true },
  { role: ROLES.MEDICAL_ADMIN, endpoint: 'users.create', expect: false },
  { role: ROLES.MEDICAL_ADMIN, endpoint: 'patients.list', expect: true },
  { role: ROLES.ACCOUNTANT, endpoint: 'payments.list', expect: true },
  { role: ROLES.ACCOUNTANT, endpoint: 'users.list', expect: false },
  { role: ROLES.SUPPORT_STAFF, endpoint: 'support.tickets.list', expect: true },
  { role: ROLES.SUPPORT_STAFF, endpoint: 'settings.manage', expect: false },
  { role: ROLES.INSURANCE_STAFF, endpoint: 'insurance.cases.decide', expect: true },
  { role: ROLES.INSURANCE_STAFF, endpoint: 'patients.insurance.read', expect: true },
  { role: ROLES.INSURANCE_STAFF, endpoint: 'patients.insurance.verify', expect: true },
  { role: ROLES.SUPPORT_STAFF, endpoint: 'patients.insurance.read', expect: true },
  { role: ROLES.SUPPORT_STAFF, endpoint: 'patients.insurance.verify', expect: false },
  { role: ROLES.PATIENT, endpoint: 'dashboard.view', expect: false },
];

function runMatrix() {
  for (const { role, endpoint, expect } of MATRIX) {
    const perms = getPermissionsForRole(role);
    const has = perms.includes(endpoint);
    assert.strictEqual(
      has,
      expect,
      `${role} ${endpoint}: expected ${expect}, got ${has}`,
    );
  }
  console.log('Authorization matrix catalog tests passed');
}

runMatrix();

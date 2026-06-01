const assert = require('assert');
const {
  NOTIFICATION_TYPE_PERMISSIONS,
  getAllowedNotificationTypes,
} = require('../../src/shared/notifications/notificationPermissions');
const { getPermissionsForRole } = require('../../src/shared/permissions/catalog');
const { ROLES, STAFF_ROLES } = require('../../src/constants');

function resolveAllowedTypes(role, permissions) {
  if (!STAFF_ROLES.includes(role)) return null;
  return getAllowedNotificationTypes(permissions);
}

function run() {
  assert.equal(NOTIFICATION_TYPE_PERMISSIONS.USER, 'users.list');

  const medicalPerms = getPermissionsForRole(ROLES.MEDICAL_ADMIN);
  const medicalTypes = getAllowedNotificationTypes(medicalPerms);
  assert.ok(medicalTypes.includes('USER'), 'Medical admin should see USER notifications');
  assert.ok(medicalTypes.includes('APPOINTMENT'));

  const accountantPerms = getPermissionsForRole(ROLES.ACCOUNTANT);
  const accountantTypes = getAllowedNotificationTypes(accountantPerms);
  assert.ok(!accountantTypes.includes('USER'), 'Accountant should not see USER notifications');
  assert.ok(accountantTypes.includes('PAYMENT'));

  assert.equal(resolveAllowedTypes(ROLES.DOCTOR, []), null, 'Doctor should not filter by permission types');
  assert.equal(resolveAllowedTypes(ROLES.PATIENT, []), null, 'Patient should not filter by permission types');
  assert.ok(Array.isArray(resolveAllowedTypes(ROLES.MEDICAL_ADMIN, medicalPerms)));

  console.log('notification.permissions.test.js: OK');
}

run();

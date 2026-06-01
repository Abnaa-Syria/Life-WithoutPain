const assert = require('assert');
const { getPermissionsForRole } = require('../../src/shared/permissions/catalog');
const { ROLES } = require('../../src/constants');
const { hasPermission } = require('../../src/modules/rbac/permission.service');

function run() {
  const medicalPerms = getPermissionsForRole(ROLES.MEDICAL_ADMIN);
  assert.ok(hasPermission(medicalPerms, 'users.list'), 'Medical admin must have users.list for registration alerts');

  const supportPerms = getPermissionsForRole(ROLES.SUPPORT_STAFF);
  assert.ok(!hasPermission(supportPerms, 'users.list'), 'Support staff should not receive USER registration alerts');

  const superPerms = getPermissionsForRole(ROLES.SUPER_ADMIN);
  assert.ok(hasPermission(superPerms, 'users.list'));

  console.log('user.listener.test.js: OK');
}

run();

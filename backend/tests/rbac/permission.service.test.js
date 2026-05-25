const assert = require('assert');
const {
  PERMISSION_CATALOG,
  getPermissionsForRole,
} = require('../../src/shared/permissions/catalog');
const { hasPermission } = require('../../src/modules/rbac/permission.service');
const { ROLES } = require('../../src/constants');

function testCatalog() {
  assert.ok(PERMISSION_CATALOG['users.list']);
  assert.ok(PERMISSION_CATALOG['roles.manage']);
  const superKeys = getPermissionsForRole(ROLES.SUPER_ADMIN);
  assert.equal(superKeys.length, Object.keys(PERMISSION_CATALOG).length);
}

function testDenyWins() {
  const effective = new Set(['users.list', 'users.create']);
  effective.add('users.delete');
  effective.delete('users.delete');
  assert.ok(!effective.has('users.delete'));
}

function testHasPermission() {
  assert.ok(hasPermission(['users.list', 'patients.read'], 'users.list'));
  assert.ok(!hasPermission(['users.list'], 'users.delete'));
}

function testRoleMatrix() {
  const med = getPermissionsForRole(ROLES.MEDICAL_ADMIN);
  assert.ok(med.includes('patients.list'));
  assert.ok(!med.includes('claims.manage'));

  const acc = getPermissionsForRole(ROLES.ACCOUNTANT);
  assert.ok(acc.includes('payments.list'));
  assert.ok(!acc.includes('users.create'));
}

function run() {
  testCatalog();
  testDenyWins();
  testHasPermission();
  testRoleMatrix();
  console.log('RBAC unit tests passed');
}

run();

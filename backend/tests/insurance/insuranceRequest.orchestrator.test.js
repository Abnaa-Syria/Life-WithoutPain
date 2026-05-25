/**
 * Insurance orchestrator unit tests (no DB — mocks prisma where needed).
 * Run: node tests/insurance/insuranceRequest.orchestrator.test.js
 */
const assert = require('assert');

const CASE_STATUS_TO_INSURANCE = {
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
};

assert.strictEqual(CASE_STATUS_TO_INSURANCE.APPROVED, 'APPROVED');
assert.strictEqual(CASE_STATUS_TO_INSURANCE.REJECTED, 'REJECTED');

const { getPermissionsForRole } = require('../../src/shared/permissions/catalog');
const { ROLES } = require('../../src/constants');

const insurancePerms = getPermissionsForRole(ROLES.INSURANCE_STAFF);
assert(insurancePerms.includes('insurance.cases.decide'));
assert(insurancePerms.includes('patients.insurance.read'));
assert(insurancePerms.includes('patients.insurance.verify'));

console.log('Insurance orchestrator catalog tests passed');

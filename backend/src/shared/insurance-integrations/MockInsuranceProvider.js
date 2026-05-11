const InsuranceIntegrationProvider = require('./InsuranceIntegrationProvider');
const logger = require('../../config/logger');

class MockInsuranceIntegration extends InsuranceIntegrationProvider {
  async validateMembership({ memberId, policyNumber }) {
    logger.info({ msg: '[MOCK INSURANCE] Validating membership', memberId, policyNumber });
    return {
      success: true,
      valid: true,
      memberName: 'Test Member',
      policyStatus: 'ACTIVE',
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      provider: 'mock',
    };
  }

  async requestPreAuthorization({ memberId, procedureCode, amount }) {
    logger.info({ msg: '[MOCK INSURANCE] Pre-authorization request', memberId, procedureCode });
    const autoApprove = amount < 500;
    return {
      success: true,
      approved: autoApprove,
      referenceId: `MOCK-AUTH-${Date.now()}`,
      approvedAmount: autoApprove ? amount : 0,
      status: autoApprove ? 'APPROVED' : 'PENDING_REVIEW',
      provider: 'mock',
    };
  }

  async checkApprovalStatus(referenceId) {
    logger.info({ msg: '[MOCK INSURANCE] Checking approval status', referenceId });
    return { success: true, status: 'APPROVED', referenceId, provider: 'mock' };
  }

  async submitClaim({ claimItems, batchId }) {
    logger.info({ msg: '[MOCK INSURANCE] Claim submitted', batchId, itemCount: claimItems?.length });
    return {
      success: true,
      referenceId: `MOCK-CLAIM-${Date.now()}`,
      status: 'SUBMITTED',
      provider: 'mock',
    };
  }
}

module.exports = MockInsuranceIntegration;

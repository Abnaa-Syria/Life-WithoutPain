class InsuranceIntegrationProvider {
  async validateMembership(data) { throw new Error('Not implemented'); }
  async requestPreAuthorization(data) { throw new Error('Not implemented'); }
  async checkApprovalStatus(referenceId) { throw new Error('Not implemented'); }
  async submitClaim(data) { throw new Error('Not implemented'); }
}

module.exports = InsuranceIntegrationProvider;

class PaymentProvider {
  async initiate(data) { throw new Error('Not implemented'); }
  async verify(transactionRef) { throw new Error('Not implemented'); }
  async handleWebhook(payload, signature) { throw new Error('Not implemented'); }
}

module.exports = PaymentProvider;

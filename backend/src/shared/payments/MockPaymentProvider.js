const { v4: uuidv4 } = require('uuid');
const PaymentProvider = require('./PaymentProvider');
const logger = require('../../config/logger');

class MockPaymentProvider extends PaymentProvider {
  async initiate({ amount, currency, description }) {
    const transactionRef = `MOCK-${uuidv4().slice(0, 8).toUpperCase()}`;
    logger.info({ msg: '[MOCK PAYMENT] Payment initiated', amount, currency, transactionRef });
    return {
      success: true,
      transactionReference: transactionRef,
      paymentUrl: `https://mock-payment.example.com/pay/${transactionRef}`,
      provider: 'mock',
    };
  }

  async verify(transactionRef) {
    logger.info({ msg: '[MOCK PAYMENT] Payment verified', transactionRef });
    return { success: true, status: 'PAID', transactionReference: transactionRef };
  }

  async handleWebhook(payload) {
    logger.info({ msg: '[MOCK PAYMENT] Webhook received', payload });
    return { success: true, status: 'PAID', transactionReference: payload.transactionRef || 'MOCK-REF' };
  }
}

module.exports = MockPaymentProvider;

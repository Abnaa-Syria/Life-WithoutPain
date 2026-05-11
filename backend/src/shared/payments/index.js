const config = require('../../config');
const MockPaymentProvider = require('./MockPaymentProvider');

const getPaymentProvider = () => {
  switch (config.payment.provider) {
    case 'mock':
    default:
      return new MockPaymentProvider();
  }
};

module.exports = getPaymentProvider();

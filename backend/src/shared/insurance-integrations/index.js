const config = require('../../config');
const MockInsuranceIntegration = require('./MockInsuranceProvider');

const getInsuranceProvider = () => {
  switch (config.insurance.provider) {
    case 'mock':
    default:
      return new MockInsuranceIntegration();
  }
};

module.exports = getInsuranceProvider();

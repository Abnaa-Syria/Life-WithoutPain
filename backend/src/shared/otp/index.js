const config = require('../../config');
const MockOtpProvider = require('./MockOtpProvider');

const getOtpProvider = () => {
  switch (config.otp.provider) {
    case 'mock':
    default:
      return new MockOtpProvider();
  }
};

module.exports = getOtpProvider();

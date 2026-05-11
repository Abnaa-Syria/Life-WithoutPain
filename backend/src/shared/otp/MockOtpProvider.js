const OtpProvider = require('./OtpProvider');
const logger = require('../../config/logger');

class MockOtpProvider extends OtpProvider {
  async send(phone, code) {
    logger.info({ msg: `[MOCK OTP] Sending OTP ${code} to ${phone}` });
    return { success: true, provider: 'mock' };
  }

  async verify(phone, code) {
    return { success: true, provider: 'mock' };
  }
}

module.exports = MockOtpProvider;

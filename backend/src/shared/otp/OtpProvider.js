class OtpProvider {
  async send(phone, code) { throw new Error('Not implemented'); }
  async verify(phone, code) { throw new Error('Not implemented'); }
}

module.exports = OtpProvider;

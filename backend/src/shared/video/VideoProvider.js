class VideoProvider {
  async createSession(data) { throw new Error('Not implemented'); }
  async endSession(sessionId) { throw new Error('Not implemented'); }
  getJoinUrl(sessionId, role) { throw new Error('Not implemented'); }
}

module.exports = VideoProvider;

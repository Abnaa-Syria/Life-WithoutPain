const { v4: uuidv4 } = require('uuid');
const VideoProvider = require('./VideoProvider');
const logger = require('../../config/logger');

class MockVideoProvider extends VideoProvider {
  async createSession({ appointmentId, type }) {
    const sessionId = `MOCK-SESSION-${uuidv4().slice(0, 8)}`;
    logger.info({ msg: '[MOCK VIDEO] Session created', sessionId, type });
    return {
      success: true,
      sessionId,
      joinUrlPatient: `https://mock-video.example.com/join/${sessionId}?role=patient`,
      joinUrlDoctor: `https://mock-video.example.com/join/${sessionId}?role=doctor`,
      provider: 'mock',
    };
  }

  async endSession(sessionId) {
    logger.info({ msg: '[MOCK VIDEO] Session ended', sessionId });
    return { success: true };
  }

  getJoinUrl(sessionId, role) {
    return `https://mock-video.example.com/join/${sessionId}?role=${role}`;
  }
}

module.exports = MockVideoProvider;

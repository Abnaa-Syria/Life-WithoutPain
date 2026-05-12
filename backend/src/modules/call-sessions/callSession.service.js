const CallSessionRepository = require('./callSession.repository');
const { NotFoundError } = require('../../shared/errors/AppError');
const videoProvider = require('../../shared/video');

class CallSessionService {
  static async create(body) {
    const session = await videoProvider.createSession({
      appointmentId: body.appointmentId,
      type: body.sessionType || 'VIDEO',
    });

    return CallSessionRepository.create({
      data: {
        appointmentId: body.appointmentId,
        patientId: body.patientId,
        doctorId: body.doctorId,
        sessionType: body.sessionType || 'VIDEO',
        provider: session.provider,
        sessionId: session.sessionId,
        joinUrlPatient: session.joinUrlPatient,
        joinUrlDoctor: session.joinUrlDoctor,
      },
    });
  }

  static async getById(id) {
    const data = await CallSessionRepository.findUnique({ where: { id: parseInt(id) } });
    if (!data) throw new NotFoundError('Call session not found');
    return data;
  }

  static async start(id) {
    return CallSessionRepository.update({
      where: { id: parseInt(id) },
      data: { status: 'IN_PROGRESS', startedAt: new Date() },
    });
  }

  static async end(id) {
    const session = await CallSessionRepository.findUnique({ where: { id: parseInt(id) } });
    if (!session) throw new NotFoundError('Call session not found');

    const duration = session.startedAt ? Math.floor((new Date() - session.startedAt) / 1000) : 0;
    return CallSessionRepository.update({
      where: { id: parseInt(id) },
      data: { status: 'COMPLETED', endedAt: new Date(), durationSeconds: duration },
    });
  }
}

module.exports = CallSessionService;

const ConversationRepository = require('./conversation.repository');
const MessageRepository = require('./message.repository');
const DoctorRepository = require('../doctors/doctor.repository');
const PatientRepository = require('../patients/patient.repository');
const { NotFoundError } = require('../../shared/errors/AppError');
const { buildPagination } = require('../../utils/pagination');

class ConversationService {
  static async list(userId, query) {
    const { page, limit, skip } = buildPagination(query);

    const patientProfile = await PatientRepository.findUnique({ where: { userId } });
    const doctorProfile = await DoctorRepository.findUnique({ where: { userId } });

    const where = {};
    if (patientProfile) where.patientId = patientProfile.id;
    else if (doctorProfile) where.doctorId = doctorProfile.id;

    const [data, total] = await Promise.all([
      ConversationRepository.findMany({
        where, skip, take: limit, orderBy: { updatedAt: 'desc' },
        include: {
          patient: { include: { user: { select: { fullName: true, avatarUrl: true } } } },
          doctor: { include: { user: { select: { fullName: true, avatarUrl: true } } } },
          messages: { take: 1, orderBy: { sentAt: 'desc' } },
        },
      }),
      ConversationRepository.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  static async create(body) {
    return ConversationRepository.create({
      data: {
        patientId: body.patientId,
        doctorId: body.doctorId,
        appointmentId: body.appointmentId || null,
      },
    });
  }

  static async getById(id) {
    const data = await ConversationRepository.findUnique({
      where: { id: parseInt(id) },
      include: {
        patient: { include: { user: { select: { fullName: true, avatarUrl: true } } } },
        doctor: { include: { user: { select: { fullName: true, avatarUrl: true } } } },
      },
    });
    if (!data) throw new NotFoundError('Conversation not found');
    return data;
  }

  static async getMessages(conversationId, query) {
    const { page, limit, skip } = buildPagination(query);
    const where = { conversationId: parseInt(conversationId) };

    const [data, total] = await Promise.all([
      MessageRepository.findMany({
        where, skip, take: limit, orderBy: { sentAt: 'desc' },
        include: { sender: { select: { fullName: true, avatarUrl: true, role: true } } },
      }),
      MessageRepository.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  static async sendMessage(conversationId, senderId, body) {
    const msg = await MessageRepository.create({
      data: {
        conversationId: parseInt(conversationId),
        senderId,
        messageType: body.messageType || 'TEXT',
        content: body.content,
        attachmentUrl: body.attachmentUrl || null,
      },
      include: { sender: { select: { fullName: true, avatarUrl: true } } },
    });
    await ConversationRepository.update({ where: { id: parseInt(conversationId) }, data: { updatedAt: new Date() } });
    return msg;
  }

  static async markMessageRead(messageId) {
    return MessageRepository.update({ where: { id: parseInt(messageId) }, data: { readAt: new Date() } });
  }
}

module.exports = ConversationService;

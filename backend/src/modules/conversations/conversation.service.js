const ConversationRepository = require('./conversation.repository');
const MessageRepository = require('./message.repository');
const DoctorRepository = require('../doctors/doctor.repository');
const PatientRepository = require('../patients/patient.repository');
const prisma = require('../../config/database');
const { NotFoundError, ForbiddenError, BadRequestError } = require('../../shared/errors/AppError');
const { resolveDoctorProfile, assertDoctorOwnsAppointment } = require('../../shared/utils/doctorAppContext');
const { buildPagination } = require('../../utils/pagination');
const { eventEmitter, EVENTS } = require('../../shared/events/eventEmitter');

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
    let doctorId = body.doctorId != null ? parseInt(body.doctorId, 10) : null;
    const appointmentId = body.appointmentId != null ? parseInt(body.appointmentId, 10) : null;

    if (appointmentId) {
      const appointment = await prisma.appointment.findFirst({
        where: { id: appointmentId, patientId: body.patientId },
        select: { doctorId: true },
      });
      if (!appointment) throw new BadRequestError('INVALID_APPOINTMENT_FOR_PATIENT');
      doctorId = appointment.doctorId;
    }

    if (!doctorId || Number.isNaN(doctorId)) {
      throw new BadRequestError('DOCTOR_ID_REQUIRED');
    }

    const doctor = await DoctorRepository.findUnique({ where: { id: doctorId } });
    if (!doctor) throw new BadRequestError('INVALID_DOCTOR_ID');

    return ConversationRepository.create({
      data: {
        patientId: body.patientId,
        doctorId,
        appointmentId: appointmentId || null,
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
    if (!data) throw new NotFoundError('CONVERSATION_NOT_FOUND');
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
    const conversation = await ConversationRepository.findUnique({
      where: { id: parseInt(conversationId) },
      include: {
        patient: { select: { userId: true } },
        doctor: { select: { userId: true } },
      },
    });
    if (!conversation) throw new NotFoundError('CONVERSATION_NOT_FOUND');

    const msg = await MessageRepository.create({
      data: {
        conversationId: parseInt(conversationId),
        senderId,
        messageType: body.messageType || 'TEXT',
        content: body.content ?? body.body,
        attachmentUrl: body.attachmentUrl || null,
      },
      include: { sender: { select: { fullName: true, avatarUrl: true, role: true } } },
    });
    await ConversationRepository.update({ where: { id: parseInt(conversationId) }, data: { updatedAt: new Date() } });

    let recipientUserId = null;
    if (conversation.patient?.userId === senderId) {
      recipientUserId = conversation.doctor?.userId;
    } else if (conversation.doctor?.userId === senderId) {
      recipientUserId = conversation.patient?.userId;
    }

    if (recipientUserId && recipientUserId !== senderId) {
      eventEmitter.emit(EVENTS.CHAT.MESSAGE_SENT, {
        conversation,
        message: msg,
        recipientUserId,
      });
    }

    return msg;
  }

  static async markMessageRead(messageId) {
    return MessageRepository.update({ where: { id: parseInt(messageId) }, data: { readAt: new Date() } });
  }

  static async getOrCreateForAppointment(appointmentId, doctorId, patientId) {
    let conversation = await ConversationRepository.findFirst({
      where: { appointmentId: parseInt(appointmentId) },
    });
    if (!conversation) {
      conversation = await ConversationRepository.create({
        data: { appointmentId: parseInt(appointmentId), doctorId, patientId },
      });
    }
    return conversation;
  }

  static async getAppointmentChatForDoctor(userId, appointmentId, query) {
    const { doctorId } = await resolveDoctorProfile(userId);
    const appointment = await assertDoctorOwnsAppointment(doctorId, appointmentId);
    const conversation = await this.getOrCreateForAppointment(appointmentId, doctorId, appointment.patientId);
    const messages = await this.getMessages(conversation.id, query);
    return { conversation, ...messages };
  }

  static async sendAppointmentMessageForDoctor(userId, appointmentId, body) {
    const { doctorId } = await resolveDoctorProfile(userId);
    const appointment = await assertDoctorOwnsAppointment(doctorId, appointmentId);
    const conversation = await this.getOrCreateForAppointment(appointmentId, doctorId, appointment.patientId);
    return this.sendMessage(conversation.id, userId, { content: body.message || body.content });
  }
}

module.exports = ConversationService;

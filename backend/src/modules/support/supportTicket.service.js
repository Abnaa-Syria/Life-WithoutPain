const prisma = require('../../config/database');
const SupportTicketRepository = require('./supportTicket.repository');
const SupportMessageRepository = require('./supportMessage.repository');
const SupportAttachmentRepository = require('./supportAttachment.repository');
const { NotFoundError, ForbiddenError, BadRequestError } = require('../../shared/errors/AppError');
const { buildPagination } = require('../../utils/pagination');
const { resolvePatientProfile } = require('../../shared/utils/patientAppContext');
const { resolveDoctorProfile } = require('../../shared/utils/doctorAppContext');
const { eventEmitter, EVENTS } = require('../../shared/events/eventEmitter');
const { isStaffRole } = require('./support.mapper');
const { ROLES } = require('../../constants');

const TICKET_INCLUDE = {
  assignee: { select: { id: true, fullName: true } },
  creator: { select: { id: true, fullName: true, role: true } },
  patient: { include: { user: { select: { id: true, fullName: true, phone: true, email: true } } } },
  doctor: { include: { user: { select: { id: true, fullName: true, phone: true, email: true } } } },
  attachments: true,
  messages: {
    orderBy: { sentAt: 'asc' },
    include: {
      sender: { select: { id: true, fullName: true, role: true, avatarUrl: true } },
      attachments: true,
    },
  },
};

const LIST_INCLUDE = {
  assignee: { select: { id: true, fullName: true } },
  messages: { orderBy: { sentAt: 'desc' }, take: 1, select: { content: true, sentAt: true } },
};

function buildFileAttachments(files, uploadedBy) {
  if (!files?.length) return [];
  return files.map((f) => ({
    fileUrl: `/uploads/${f.filename}`,
    fileName: f.originalname,
    mimeType: f.mimetype,
    uploadedBy,
  }));
}

class SupportTicketService {
  static async getUnreadCount(ticketId, userId) {
    return prisma.supportMessage.count({
      where: {
        supportCaseId: parseInt(ticketId, 10),
        senderId: { not: userId },
        readAt: null,
      },
    });
  }

  static async markMessagesRead(ticketId, userId) {
    await prisma.supportMessage.updateMany({
      where: {
        supportCaseId: parseInt(ticketId, 10),
        senderId: { not: userId },
        readAt: null,
      },
      data: { readAt: new Date() },
    });
  }

  static async assertTicketAccess(ticket, userId, userRole) {
    if (isStaffRole(userRole)) return;
    if (ticket.createdByUserId === userId) return;
    if (userRole === ROLES.PATIENT && ticket.patientId) {
      const { patientId } = await resolvePatientProfile(userId);
      if (ticket.patientId === patientId) return;
    }
    if (userRole === ROLES.DOCTOR && ticket.doctorId) {
      const { doctorId } = await resolveDoctorProfile(userId);
      if (ticket.doctorId === doctorId && ticket.createdByUserId === userId) return;
    }
    throw new ForbiddenError('You do not have access to this support ticket');
  }

  static async getTicketRaw(id) {
    const data = await SupportTicketRepository.findUnique({
      where: { id: parseInt(id, 10) },
      include: TICKET_INCLUDE,
    });
    if (!data) throw new NotFoundError('Support ticket not found');
    return data;
  }

  static async createTicket({ userId, role, body, files = [] }) {
    const now = new Date();
    let patientId = null;
    let doctorId = null;
    let creatorRole = role === ROLES.DOCTOR ? 'DOCTOR' : 'PATIENT';

    if (role === ROLES.PATIENT) {
      const resolved = await resolvePatientProfile(userId);
      patientId = resolved.patientId;
    } else if (role === ROLES.DOCTOR) {
      const resolved = await resolveDoctorProfile(userId);
      doctorId = resolved.doctorId;
    } else {
      throw new BadRequestError('Only patients and doctors can create support tickets');
    }

    const fileData = buildFileAttachments(files, userId);

    const ticket = await prisma.$transaction(async (tx) => {
      const created = await tx.supportCase.create({
        data: {
          createdByUserId: userId,
          creatorRole,
          patientId,
          doctorId,
          category: body.category,
          priority: body.priority || 'MEDIUM',
          status: 'OPEN',
          subject: body.subject,
          description: body.description,
          lastActivityAt: now,
        },
      });

      await tx.supportMessage.create({
        data: {
          supportCaseId: created.id,
          senderId: userId,
          messageType: 'TEXT',
          content: body.description,
        },
      });

      if (fileData.length) {
        await tx.supportAttachment.createMany({
          data: fileData.map((f) => ({ ...f, ticketId: created.id })),
        });
      }

      return created;
    });

    const full = await this.getTicketRaw(ticket.id);
    eventEmitter.emit(EVENTS.SUPPORT.TICKET_CREATED, full);
    return full;
  }

  static async listTicketsForUser(userId, role, query) {
    const { page, limit, skip } = buildPagination(query);
    const where = {};

    if (role === ROLES.PATIENT) {
      const { patientId } = await resolvePatientProfile(userId);
      where.patientId = patientId;
    } else if (role === ROLES.DOCTOR) {
      const { doctorId } = await resolveDoctorProfile(userId);
      where.doctorId = doctorId;
      where.createdByUserId = userId;
    }

    if (query.status) where.status = query.status;
    if (query.category) where.category = query.category;

    const orderBy = { lastActivityAt: 'desc' };

    const [data, total] = await Promise.all([
      SupportTicketRepository.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: LIST_INCLUDE,
      }),
      SupportTicketRepository.count({ where }),
    ]);

    const withUnread = await Promise.all(
      data.map(async (t) => ({
        ticket: t,
        unreadCount: await this.getUnreadCount(t.id, userId),
      })),
    );

    return {
      data: withUnread,
      total,
      page,
      limit,
    };
  }

  static async getTicketForUser(userId, role, id) {
    const ticket = await this.getTicketRaw(id);
    await this.assertTicketAccess(ticket, userId, role);
    await this.markMessagesRead(id, userId);
    const unreadCount = await this.getUnreadCount(id, userId);
    return { ticket, unreadCount };
  }

  static async addMessage({ ticketId, senderId, senderRole, body, files = [] }) {
    const ticket = await this.getTicketRaw(ticketId);
    await this.assertTicketAccess(ticket, senderId, senderRole);

    if (ticket.status === 'CLOSED') {
      throw new BadRequestError('Cannot reply to a closed ticket');
    }

    const content = body.message || body.content;
    const fileData = buildFileAttachments(files, senderId);
    const now = new Date();

    const message = await prisma.$transaction(async (tx) => {
      const msg = await tx.supportMessage.create({
        data: {
          supportCaseId: parseInt(ticketId, 10),
          senderId,
          messageType: 'TEXT',
          content,
          attachmentUrl: fileData[0]?.fileUrl || body.attachmentUrl || null,
        },
        include: {
          sender: { select: { id: true, fullName: true, role: true, avatarUrl: true } },
        },
      });

      if (fileData.length) {
        await tx.supportAttachment.createMany({
          data: fileData.map((f) => ({
            ...f,
            ticketId: parseInt(ticketId, 10),
            messageId: msg.id,
          })),
        });
      }

      await tx.supportCase.update({
        where: { id: parseInt(ticketId, 10) },
        data: { lastActivityAt: now, updatedAt: now },
      });

      return msg;
    });

    const fullMessage = await SupportMessageRepository.findUnique({
      where: { id: message.id },
      include: {
        sender: { select: { id: true, fullName: true, role: true, avatarUrl: true } },
        attachments: true,
      },
    });

    const payload = { ticket, message: fullMessage, senderRole };
    if (isStaffRole(senderRole)) {
      eventEmitter.emit(EVENTS.SUPPORT.MESSAGE_RECEIVED, payload);
    } else {
      eventEmitter.emit(EVENTS.SUPPORT.TICKET_CREATED, ticket);
    }

    return fullMessage;
  }

  static async listTicketsAdmin(query) {
    const { page, limit, skip } = buildPagination(query);
    const where = {};

    if (query.status) where.status = query.status;
    if (query.category) where.category = query.category;
    if (query.creatorRole) where.creatorRole = query.creatorRole;
    if (query.assignedAdminId) where.assignedTo = parseInt(query.assignedAdminId, 10);
    if (query.search) {
      where.OR = [
        { subject: { contains: query.search } },
        { description: { contains: query.search } },
      ];
    }

    const sortField = query.sortBy || 'lastActivityAt';
    const sortOrder = query.sortOrder || 'desc';
    const orderBy = { [sortField]: sortOrder };

    const [data, total] = await Promise.all([
      SupportTicketRepository.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          ...LIST_INCLUDE,
          patient: { include: { user: { select: { fullName: true } } } },
          doctor: { include: { user: { select: { fullName: true } } } },
          creator: { select: { fullName: true } },
        },
      }),
      SupportTicketRepository.count({ where }),
    ]);

    const adminUserId = query.adminUserId;
    const withUnread = await Promise.all(
      data.map(async (t) => ({
        ticket: t,
        unreadCount: adminUserId ? await this.getUnreadCount(t.id, adminUserId) : 0,
      })),
    );

    return { data: withUnread, total, page, limit };
  }

  static async getTicketAdmin(id, adminUserId) {
    const ticket = await this.getTicketRaw(id);
    if (adminUserId) await this.markMessagesRead(id, adminUserId);
    const unreadCount = adminUserId ? await this.getUnreadCount(id, adminUserId) : 0;
    return { ticket, unreadCount };
  }

  static async updateStatus(id, body, actorId) {
    const existing = await this.getTicketRaw(id);
    const updateData = { status: body.status, lastActivityAt: new Date() };
    if (body.status === 'RESOLVED' || body.status === 'CLOSED') {
      updateData.resolutionNotes = body.resolutionNotes ?? existing.resolutionNotes;
    }

    const data = await SupportTicketRepository.update({
      where: { id: parseInt(id, 10) },
      data: updateData,
      include: TICKET_INCLUDE,
    });

    eventEmitter.emit(EVENTS.SUPPORT.STATUS_CHANGED, { ticket: data, actorId });
    return data;
  }

  static async assignTicket(id, assignedAdminId) {
    const data = await SupportTicketRepository.update({
      where: { id: parseInt(id, 10) },
      data: {
        assignedTo: parseInt(assignedAdminId, 10),
        status: 'IN_PROGRESS',
        lastActivityAt: new Date(),
      },
      include: TICKET_INCLUDE,
    });
    return data;
  }

  // Legacy compatibility
  static async create(data) {
    return SupportTicketRepository.create({ data });
  }

  static async list(query) {
    const result = await this.listTicketsAdmin({ ...query, adminUserId: null });
    return {
      data: result.data.map((x) => x.ticket),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }

  static async getById(id) {
    return this.getTicketRaw(id);
  }

  static async createForPatient(userId, data) {
    return this.createTicket({
      userId,
      role: ROLES.PATIENT,
      body: {
        subject: data.subject,
        description: data.description,
        category: data.category || data.type || 'OTHER',
        priority: data.priority,
      },
    });
  }

  static async listForPatient(userId, query) {
    const result = await this.listTicketsForUser(userId, ROLES.PATIENT, query);
    return {
      data: result.data.map((x) => x.ticket),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }

  static async getByIdForPatient(userId, id) {
    const { ticket } = await this.getTicketForUser(userId, ROLES.PATIENT, id);
    return ticket;
  }

  static async assign(id, assignedTo) {
    return this.assignTicket(id, assignedTo);
  }

  static async getMessages(supportCaseId, userId, userRole) {
    const ticket = await this.getTicketRaw(supportCaseId);
    if (userId && userRole) await this.assertTicketAccess(ticket, userId, userRole);
    return ticket.messages;
  }
}

module.exports = SupportTicketService;

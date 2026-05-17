const SupportCaseRepository = require('./supportCase.repository');
const SupportMessageRepository = require('./supportMessage.repository');
const prisma = require('../../config/database');
const { NotFoundError, ForbiddenError } = require('../../shared/errors/AppError');
const { buildPagination } = require('../../utils/pagination');
const { resolvePatientProfile } = require('../../shared/utils/patientAppContext');

class SupportCaseService {
  static async create(data) {
    return SupportCaseRepository.create({ data });
  }

  static async createForPatient(userId, data) {
    const { patientId } = await resolvePatientProfile(userId);
    return SupportCaseRepository.create({
      data: {
        patientId,
        subject: data.subject,
        description: data.description,
        type: data.type || 'GENERAL',
        priority: data.priority || 'MEDIUM',
        status: 'OPEN',
      },
    });
  }

  static async listForPatient(userId, query) {
    const { patientId } = await resolvePatientProfile(userId);
    const { page, limit, skip } = buildPagination(query);
    const where = { patientId };
    if (query.status) where.status = query.status;

    const [data, total] = await Promise.all([
      SupportCaseRepository.findMany({
        where, skip, take: limit, orderBy: { createdAt: 'desc' },
        include: { assignee: { select: { fullName: true } } },
      }),
      SupportCaseRepository.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  static async getByIdForPatient(userId, id) {
    const { patientId } = await resolvePatientProfile(userId);
    const data = await this.getById(id);
    if (data.patientId !== patientId) {
      throw new ForbiddenError('You do not have access to this support case');
    }
    return data;
  }

  static async list(query) {
    const { page, limit, skip } = buildPagination(query);
    const where = {};
    if (query.status) where.status = query.status;
    if (query.type) where.type = query.type;
    if (query.priority) where.priority = query.priority;
    if (query.assignedTo) where.assignedTo = parseInt(query.assignedTo);

    const [data, total] = await Promise.all([
      SupportCaseRepository.findMany({
        where, skip, take: limit, orderBy: { createdAt: 'desc' },
        include: {
          patient: { include: { user: { select: { fullName: true } } } },
          assignee: { select: { fullName: true } },
        },
      }),
      SupportCaseRepository.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  static async getById(id) {
    const data = await SupportCaseRepository.findUnique({
      where: { id: parseInt(id) },
      include: {
        patient: { include: { user: { select: { fullName: true, email: true, phone: true } } } },
        assignee: { select: { fullName: true } },
        insuranceCase: true,
        messages: { orderBy: { sentAt: 'asc' }, include: { sender: { select: { fullName: true, role: true } } } },
      },
    });
    if (!data) throw new NotFoundError('Support case not found');
    return data;
  }

  static async assign(id, assignedTo) {
    return SupportCaseRepository.update({
      where: { id: parseInt(id) },
      data: { assignedTo, status: 'IN_PROGRESS' },
    });
  }

  static async updateStatus(id, body) {
    const updateData = { status: body.status };
    if (body.status === 'RESOLVED' || body.status === 'CLOSED') {
      updateData.resolutionNotes = body.resolutionNotes;
    }
    return SupportCaseRepository.update({ where: { id: parseInt(id) }, data: updateData });
  }

  static async getMessages(supportCaseId) {
    return SupportMessageRepository.findMany({
      where: { supportCaseId: parseInt(supportCaseId) },
      orderBy: { sentAt: 'asc' },
      include: { sender: { select: { fullName: true, role: true, avatarUrl: true } } },
    });
  }

  static async addMessage(supportCaseId, senderId, body) {
    return SupportMessageRepository.create({
      data: {
        supportCaseId: parseInt(supportCaseId),
        senderId,
        messageType: body.messageType || 'TEXT',
        content: body.content,
        attachmentUrl: body.attachmentUrl || null,
      },
      include: { sender: { select: { fullName: true, role: true } } },
    });
  }
}

module.exports = SupportCaseService;

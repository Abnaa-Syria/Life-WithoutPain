const InsuranceCaseRepository = require('./insuranceCase.repository');
const InsuranceApprovalRepository = require('./insuranceApproval.repository');
const { NotFoundError } = require('../../shared/errors/AppError');
const { buildPagination } = require('../../utils/pagination');
const { createAuditLog } = require('../../middlewares/auditLog');

class InsuranceCaseService {
  static async create(data) {
    return InsuranceCaseRepository.create({ data, include: { provider: true } });
  }

  static async list(query) {
    const { page, limit, skip } = buildPagination(query);
    const where = {};
    if (query.status) where.status = query.status;
    if (query.providerId) where.providerId = parseInt(query.providerId);
    if (query.patientId) where.patientId = parseInt(query.patientId);

    const [data, total] = await Promise.all([
      InsuranceCaseRepository.findMany({
        where, skip, take: limit, orderBy: { createdAt: 'desc' },
        include: { patient: { include: { user: { select: { fullName: true } } } }, provider: true },
      }),
      InsuranceCaseRepository.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  static async getById(id) {
    const data = await InsuranceCaseRepository.findUnique({
      where: { id: parseInt(id) },
      include: {
        patient: { include: { user: { select: { fullName: true, email: true, phone: true } } } },
        provider: true,
        approvals: true,
        supportCases: true,
      },
    });
    if (!data) throw new NotFoundError('Insurance case not found');
    return data;
  }

  static async approve(id, body, actorId, req) {
    const insuranceCase = await InsuranceCaseRepository.findUnique({ where: { id: parseInt(id) } });
    if (!insuranceCase) throw new NotFoundError('Insurance case not found');

    const data = await InsuranceCaseRepository.update({
      where: { id: parseInt(id) },
      data: { status: 'APPROVED', resolvedAt: new Date(), notes: body.notes },
    });

    if (body.approvalData) {
      await InsuranceApprovalRepository.create({
        data: {
          insuranceCaseId: data.id,
          requestedProcedure: body.approvalData.procedure || 'Consultation',
          approvalStatus: 'APPROVED',
          approvedAmount: body.approvalData.amount,
          decisionNotes: body.notes,
          decidedBy: actorId,
          decidedAt: new Date(),
        },
      });
    }

    createAuditLog({ actorId, entityType: 'InsuranceCase', entityId: data.id, action: 'APPROVE', req });
    return data;
  }

  static async reject(id, body, actorId, req) {
    const data = await InsuranceCaseRepository.update({
      where: { id: parseInt(id) },
      data: { status: 'REJECTED', resolvedAt: new Date(), notes: body.notes },
    });
    createAuditLog({ actorId, entityType: 'InsuranceCase', entityId: data.id, action: 'REJECT', req });
    return data;
  }

  static async requestInfo(id, body) {
    return InsuranceCaseRepository.update({
      where: { id: parseInt(id) },
      data: { status: 'MORE_INFO_REQUESTED', notes: body.notes },
    });
  }

  static async escalate(id, body, actorId, req) {
    const data = await InsuranceCaseRepository.update({
      where: { id: parseInt(id) },
      data: { status: 'ESCALATED', notes: body.notes },
    });
    createAuditLog({ actorId, entityType: 'InsuranceCase', entityId: data.id, action: 'ESCALATE', req });
    return data;
  }

  static async addNote(id, note) {
    const current = await InsuranceCaseRepository.findUnique({ where: { id: parseInt(id) } });
    if (!current) throw new NotFoundError('Insurance case not found');
    const notes = current.notes
      ? `${current.notes}\n[${new Date().toISOString()}] ${note}`
      : `[${new Date().toISOString()}] ${note}`;
    return InsuranceCaseRepository.update({ where: { id: parseInt(id) }, data: { notes } });
  }
}

module.exports = InsuranceCaseService;

const InsuranceCaseRepository = require('./insuranceCase.repository');
const InsuranceApprovalRepository = require('./insuranceApproval.repository');
const InsuranceRequestOrchestrator = require('./insuranceRequest.orchestrator');
const { NotFoundError } = require('../../shared/errors/AppError');
const { buildPagination } = require('../../utils/pagination');
const { createAuditLog } = require('../../middlewares/auditLog');
const { eventEmitter, EVENTS } = require('../../shared/events/eventEmitter');
const prisma = require('../../config/database');

const CASE_INCLUDE = InsuranceRequestOrchestrator.caseInclude();

class InsuranceCaseService {
  static async create(data) {
    return InsuranceCaseRepository.create({ data, include: { provider: true } });
  }

  static async list(query) {
    const { page, limit, skip } = buildPagination(query);
    const where = {};
    if (query.status) where.status = query.status;
    if (query.providerId) where.providerId = parseInt(query.providerId, 10);
    if (query.patientId) where.patientId = parseInt(query.patientId, 10);

    const [data, total] = await Promise.all([
      InsuranceCaseRepository.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          patient: { include: { user: { select: { fullName: true } } } },
          provider: true,
          appointment: { select: { id: true, amount: true, appointmentDate: true } },
          homeServiceRequest: { include: { service: { select: { nameEn: true, nameAr: true, price: true } } } },
          approvals: { orderBy: { createdAt: 'desc' }, take: 1 },
        },
      }),
      InsuranceCaseRepository.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  static async getById(id) {
    const data = await InsuranceCaseRepository.findUnique({
      where: { id: parseInt(id, 10) },
      include: CASE_INCLUDE,
    });
    if (!data) throw new NotFoundError('Insurance case not found');
    return data;
  }

  static async _loadCase(id) {
    const insuranceCase = await InsuranceCaseRepository.findUnique({
      where: { id: parseInt(id, 10) },
      include: { approvals: { orderBy: { createdAt: 'desc' } } },
    });
    if (!insuranceCase) throw new NotFoundError('Insurance case not found');
    return insuranceCase;
  }

  static async _upsertApproval(insuranceCase, body, actorId) {
    const approvalData = body.approvalData || {};
    const existing = insuranceCase.approvals?.[0];
    const payload = {
      requestedProcedure: approvalData.procedure || existing?.requestedProcedure || 'Consultation',
      approvalStatus: approvalData.approvalStatus || body.approvalStatus || 'APPROVED',
      requestedAmount: approvalData.requestedAmount ?? existing?.requestedAmount ?? insuranceCase.requestedAmount,
      approvedAmount: approvalData.approvedAmount ?? approvalData.amount ?? existing?.approvedAmount,
      decisionNotes: body.notes || approvalData.decisionNotes,
      decidedBy: actorId,
      decidedAt: new Date(),
    };

    if (existing) {
      return InsuranceApprovalRepository.update({
        where: { id: existing.id },
        data: payload,
      });
    }

    return InsuranceApprovalRepository.create({
      data: { insuranceCaseId: insuranceCase.id, ...payload },
    });
  }

  static async _emitUpdated(id) {
    const full = await this.getById(id);
    eventEmitter.emit(EVENTS.INSURANCE.CASE_UPDATED, full);
    return full;
  }

  static async approve(id, body, actorId, req) {
    const insuranceCase = await this._loadCase(id);
    const approvalStatus = body.approvalData?.approvalStatus || 'APPROVED';

    await InsuranceCaseRepository.update({
      where: { id: parseInt(id, 10) },
      data: { status: 'APPROVED', resolvedAt: new Date(), notes: body.notes ?? insuranceCase.notes },
    });

    await this._upsertApproval(insuranceCase, { ...body, approvalStatus }, actorId);
    await InsuranceRequestOrchestrator.syncBookingFromCase(
      { ...insuranceCase, status: 'APPROVED' },
      { approvalStatus, approvedAmount: body.approvalData?.approvedAmount ?? body.approvalData?.amount },
    );

    createAuditLog({ actorId, entityType: 'InsuranceCase', entityId: parseInt(id, 10), action: 'APPROVE', req });
    return this._emitUpdated(id);
  }

  static async reject(id, body, actorId, req) {
    const insuranceCase = await this._loadCase(id);

    await InsuranceCaseRepository.update({
      where: { id: parseInt(id, 10) },
      data: { status: 'REJECTED', resolvedAt: new Date(), notes: body.notes },
    });

    await this._upsertApproval(insuranceCase, { ...body, approvalStatus: 'REJECTED' }, actorId);
    await InsuranceRequestOrchestrator.syncBookingFromCase(
      { ...insuranceCase, status: 'REJECTED' },
      { approvalStatus: 'REJECTED' },
    );

    createAuditLog({ actorId, entityType: 'InsuranceCase', entityId: parseInt(id, 10), action: 'REJECT', req });
    return this._emitUpdated(id);
  }

  static async requestInfo(id, body, actorId, req) {
    const insuranceCase = await this._loadCase(id);

    await InsuranceCaseRepository.update({
      where: { id: parseInt(id, 10) },
      data: { status: 'MORE_INFO_REQUESTED', notes: body.notes },
    });

    await InsuranceRequestOrchestrator.syncBookingFromCase(
      { ...insuranceCase, status: 'MORE_INFO_REQUESTED' },
      { approvalStatus: 'PENDING' },
    );

    if (actorId && req) {
      createAuditLog({ actorId, entityType: 'InsuranceCase', entityId: parseInt(id, 10), action: 'REQUEST_INFO', req });
    }
    return this._emitUpdated(id);
  }

  static async escalate(id, body, actorId, req) {
    await InsuranceCaseRepository.update({
      where: { id: parseInt(id, 10) },
      data: { status: 'ESCALATED', notes: body.notes },
    });
    createAuditLog({ actorId, entityType: 'InsuranceCase', entityId: parseInt(id, 10), action: 'ESCALATE', req });
    return this._emitUpdated(id);
  }

  static async updateApproval(id, body, actorId, req) {
    const insuranceCase = await this._loadCase(id);
    const approvalStatus = body.approvalStatus || body.approvalData?.approvalStatus || 'PARTIALLY_APPROVED';
    const caseStatus =
      approvalStatus === 'APPROVED' ? 'APPROVED' : approvalStatus === 'REJECTED' ? 'REJECTED' : insuranceCase.status;

    if (caseStatus !== insuranceCase.status) {
      await InsuranceCaseRepository.update({
        where: { id: parseInt(id, 10) },
        data: {
          status: caseStatus,
          resolvedAt: ['APPROVED', 'REJECTED'].includes(caseStatus) ? new Date() : null,
          notes: body.notes ?? insuranceCase.notes,
        },
      });
    }

    await this._upsertApproval(insuranceCase, { ...body, approvalStatus }, actorId);
    await InsuranceRequestOrchestrator.syncBookingFromCase(
      { ...insuranceCase, status: caseStatus },
      {
        approvalStatus,
        approvedAmount: body.approvalData?.approvedAmount ?? body.approvedAmount,
      },
    );

    createAuditLog({ actorId, entityType: 'InsuranceCase', entityId: parseInt(id, 10), action: 'UPDATE_APPROVAL', req });
    return this._emitUpdated(id);
  }

  static async addNote(id, note) {
    const current = await InsuranceCaseRepository.findUnique({ where: { id: parseInt(id, 10) } });
    if (!current) throw new NotFoundError('Insurance case not found');
    const notes = current.notes
      ? `${current.notes}\n[${new Date().toISOString()}] ${note}`
      : `[${new Date().toISOString()}] ${note}`;
    return InsuranceCaseRepository.update({ where: { id: parseInt(id, 10) }, data: { notes } });
  }

  static async listForPatient(patientId, query) {
    const { page, limit, skip } = buildPagination(query);
    const where = { patientId };
    if (query.status) where.status = query.status;

    const [data, total] = await Promise.all([
      prisma.insuranceCase.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          provider: true,
          approvals: { orderBy: { createdAt: 'desc' }, take: 1 },
          appointment: { select: { id: true, appointmentDate: true, startTime: true } },
          homeServiceRequest: { include: { service: { select: { nameEn: true, nameAr: true } } } },
        },
      }),
      prisma.insuranceCase.count({ where }),
    ]);
    return { data, total, page, limit };
  }
}

module.exports = InsuranceCaseService;

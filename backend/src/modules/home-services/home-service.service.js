const prisma = require('../../config/database');
const { NotFoundError, BadRequestError } = require('../../shared/errors/AppError');
const { buildPagination } = require('../../utils/pagination');
const { resolvePatientProfile } = require('../../shared/utils/patientAppContext');
const { enrichHomeServiceRequests } = require('../../i18n/enrichRelations');

const HOME_SERVICE_INCLUDE = {
  service: true,
  assignedDoctor: {
    include: { user: { select: { fullName: true, avatarUrl: true } } },
  },
  insuranceCase: {
    include: { approvals: { orderBy: { createdAt: 'desc' }, take: 1 } },
  },
};

class HomeServiceService {
  static async assertPatientOwnsRequest(patientId, requestId) {
    const request = await prisma.homeServiceRequest.findUnique({
      where: { id: parseInt(requestId, 10) },
    });
    if (!request) throw new NotFoundError('HOME_SERVICE_NOT_FOUND');
    if (request.patientId !== patientId) {
      throw new NotFoundError('HOME_SERVICE_NOT_FOUND');
    }
    return request;
  }

  static async validateHomeService(serviceId) {
    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service || !service.isActive) {
      throw new NotFoundError('SERVICE_NOT_FOUND');
    }
    if (service.type !== 'HOME') {
      throw new BadRequestError('SERVICE_NOT_HOME_VISIT');
    }
    return service;
  }

  static async createForPatient(userId, data) {
    const { patientId } = await resolvePatientProfile(userId);
    const service = await this.validateHomeService(data.serviceId);
    const requiresInsuranceApproval = data.paymentMode === 'INSURANCE';

    if (requiresInsuranceApproval) {
      const policyCount = await prisma.patientInsurance.count({ where: { patientId } });
      if (!policyCount) {
        throw new BadRequestError('INSURANCE_REQUIRED_BEFORE_BOOKING');
      }
    }

    const preferredDate = new Date(data.preferredDate);
    if (Number.isNaN(preferredDate.getTime())) {
      throw new BadRequestError('INVALID_PREFERRED_DATE');
    }

    const homeRequest = await prisma.homeServiceRequest.create({
      data: {
        patientId,
        serviceId: data.serviceId,
        visitAddress: data.visitAddress,
        notes: data.notes || null,
        preferredDate,
        requiresInsuranceApproval,
        createdBy: userId,
      },
      include: HOME_SERVICE_INCLUDE,
    });

    if (requiresInsuranceApproval) {
      const InsuranceRequestOrchestrator = require('../insurance-cases/insuranceRequest.orchestrator');
      await InsuranceRequestOrchestrator.createForHomeService(
        { ...homeRequest, service },
        { patientInsuranceId: data.patientInsuranceId },
      );
      const created = await prisma.homeServiceRequest.findUnique({
        where: { id: homeRequest.id },
        include: {
          ...HOME_SERVICE_INCLUDE,
          insuranceCase: { include: { approvals: { orderBy: { createdAt: 'desc' }, take: 1 } } },
        },
      });
      return enrichHomeServiceRequests(created);
    }

    return enrichHomeServiceRequests(homeRequest);
  }

  static async listForPatient(userId, query) {
    const { patientId } = await resolvePatientProfile(userId);
    const { page, limit, skip } = buildPagination(query);
    const where = { patientId };
    if (query.status) where.status = query.status;

    const [data, total] = await Promise.all([
      prisma.homeServiceRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { preferredDate: 'desc' },
        include: HOME_SERVICE_INCLUDE,
      }),
      prisma.homeServiceRequest.count({ where }),
    ]);
    return { data: await enrichHomeServiceRequests(data), total, page, limit };
  }

  static async getByIdForPatient(userId, id) {
    const { patientId } = await resolvePatientProfile(userId);
    await this.assertPatientOwnsRequest(patientId, id);
    const request = await prisma.homeServiceRequest.findUnique({
      where: { id: parseInt(id, 10) },
      include: HOME_SERVICE_INCLUDE,
    });
    if (!request) throw new NotFoundError('HOME_SERVICE_NOT_FOUND');
    return enrichHomeServiceRequests(request);
  }

  static async cancelForPatient(userId, id, data = {}) {
    const { patientId } = await resolvePatientProfile(userId);
    const request = await this.assertPatientOwnsRequest(patientId, id);
    if (request.status === 'CANCELLED') {
      throw new BadRequestError('HOME_SERVICE_ALREADY_CANCELLED');
    }
    if (request.status === 'COMPLETED') {
      throw new BadRequestError('HOME_SERVICE_CANNOT_CANCEL_COMPLETED');
    }

    const updated = await prisma.homeServiceRequest.update({
      where: { id: parseInt(id, 10) },
      data: {
        status: 'CANCELLED',
        notes: data.reason
          ? [request.notes, `Cancellation: ${data.reason}`].filter(Boolean).join('\n')
          : request.notes,
      },
      include: HOME_SERVICE_INCLUDE,
    });
    return enrichHomeServiceRequests(updated);
  }
}

module.exports = HomeServiceService;

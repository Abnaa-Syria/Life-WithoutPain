const prisma = require('../../config/database');
const { NotFoundError, BadRequestError } = require('../../shared/errors/AppError');
const { buildPagination } = require('../../utils/pagination');
const { resolvePatientProfile } = require('../../shared/utils/patientAppContext');

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
    if (!request) throw new NotFoundError('Home service request not found');
    if (request.patientId !== patientId) {
      throw new NotFoundError('Home service request not found');
    }
    return request;
  }

  static async validateHomeService(serviceId) {
    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service || !service.isActive) {
      throw new NotFoundError('Service not found');
    }
    if (service.type !== 'HOME') {
      throw new BadRequestError('Service must be a home visit type. Use POST /patient/appointments for clinic or remote visits.');
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
        throw new BadRequestError('Add an insurance policy before booking with medical insurance.');
      }
    }

    const preferredDate = new Date(data.preferredDate);
    if (Number.isNaN(preferredDate.getTime())) {
      throw new BadRequestError('Invalid preferredDate');
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
      return prisma.homeServiceRequest.findUnique({
        where: { id: homeRequest.id },
        include: {
          ...HOME_SERVICE_INCLUDE,
          insuranceCase: { include: { approvals: { orderBy: { createdAt: 'desc' }, take: 1 } } },
        },
      });
    }

    return homeRequest;
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
    return { data, total, page, limit };
  }

  static async getByIdForPatient(userId, id) {
    const { patientId } = await resolvePatientProfile(userId);
    await this.assertPatientOwnsRequest(patientId, id);
    const request = await prisma.homeServiceRequest.findUnique({
      where: { id: parseInt(id, 10) },
      include: HOME_SERVICE_INCLUDE,
    });
    if (!request) throw new NotFoundError('Home service request not found');
    return request;
  }

  static async cancelForPatient(userId, id, data = {}) {
    const { patientId } = await resolvePatientProfile(userId);
    const request = await this.assertPatientOwnsRequest(patientId, id);
    if (request.status === 'CANCELLED') {
      throw new BadRequestError('Request is already cancelled');
    }
    if (request.status === 'COMPLETED') {
      throw new BadRequestError('Cannot cancel a completed request');
    }

    return prisma.homeServiceRequest.update({
      where: { id: parseInt(id, 10) },
      data: {
        status: 'CANCELLED',
        notes: data.reason
          ? [request.notes, `Cancellation: ${data.reason}`].filter(Boolean).join('\n')
          : request.notes,
      },
      include: HOME_SERVICE_INCLUDE,
    });
  }
}

module.exports = HomeServiceService;

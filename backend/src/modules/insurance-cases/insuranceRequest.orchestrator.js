const prisma = require('../../config/database');
const { BadRequestError } = require('../../shared/errors/AppError');
const { eventEmitter, EVENTS } = require('../../shared/events/eventEmitter');

const CASE_STATUS_TO_INSURANCE = {
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  MORE_INFO_REQUESTED: 'PENDING_VERIFICATION',
  UNDER_REVIEW: 'PENDING_VERIFICATION',
  OPEN: 'PENDING_VERIFICATION',
  ESCALATED: 'PENDING_VERIFICATION',
};

const APPROVAL_STATUS_TO_INSURANCE = {
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  PARTIALLY_APPROVED: 'PARTIALLY_APPROVED',
  PENDING: 'PENDING_VERIFICATION',
};

async function resolvePatientPolicy(patientId, patientInsuranceId) {
  const policies = await prisma.patientInsurance.findMany({
    where: { patientId },
    include: { provider: true },
    orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
  });

  if (!policies.length) {
    throw new BadRequestError('No insurance policy on file. Add insurance before booking with medical insurance.');
  }

  if (patientInsuranceId) {
    const selected = policies.find((p) => p.id === patientInsuranceId);
    if (!selected) throw new BadRequestError('Selected insurance policy not found');
    return selected;
  }

  const verifiedPrimary = policies.find((p) => p.isPrimary && p.verificationStatus === 'VERIFIED');
  if (verifiedPrimary) return verifiedPrimary;

  const primary = policies.find((p) => p.isPrimary);
  if (primary) return primary;

  return policies[0];
}

function mapRequestType(appointmentType, serviceType) {
  if (serviceType === 'HOME') return 'PROCEDURE';
  if (appointmentType === 'EMERGENCY') return 'CONSULTATION';
  return 'CONSULTATION';
}

function procedureLabel(appointment, service) {
  if (service?.name) return service.name;
  return appointment?.appointmentType || 'Consultation';
}

class InsuranceRequestOrchestrator {
  static async createForAppointment(appointment, options = {}) {
    const policy = await resolvePatientPolicy(appointment.patientId, options.patientInsuranceId);
    const service = appointment.serviceId
      ? await prisma.service.findUnique({ where: { id: appointment.serviceId } })
      : null;

    const requestedAmount = appointment.amount;
    const requestType = mapRequestType(appointment.appointmentType, service?.type);
    const procedure = procedureLabel(appointment, service);
    const policyNote =
      policy.verificationStatus !== 'VERIFIED'
        ? `[System] Policy verification status: ${policy.verificationStatus}`
        : null;

    const result = await prisma.$transaction(async (tx) => {
      const insuranceCase = await tx.insuranceCase.create({
        data: {
          patientId: appointment.patientId,
          appointmentId: appointment.id,
          patientInsuranceId: policy.id,
          providerId: policy.providerId,
          caseType: 'PRE_AUTHORIZATION',
          requestType,
          status: 'UNDER_REVIEW',
          requestedAmount,
          notes: policyNote,
          externalReference: `APT-${appointment.id}`,
        },
        include: {
          provider: true,
          patient: { include: { user: { select: { id: true, fullName: true } } } },
        },
      });

      await tx.insuranceApproval.create({
        data: {
          insuranceCaseId: insuranceCase.id,
          requestedProcedure: procedure,
          approvalStatus: 'PENDING',
          requestedAmount,
        },
      });

      await tx.appointment.update({
        where: { id: appointment.id },
        data: {
          insuranceStatus: 'PENDING_VERIFICATION',
          requiresInsuranceApproval: true,
        },
      });

      return insuranceCase;
    });

    const full = await prisma.insuranceCase.findUnique({
      where: { id: result.id },
      include: InsuranceRequestOrchestrator.caseInclude(),
    });

    eventEmitter.emit(EVENTS.INSURANCE.CASE_CREATED, full);
    return full;
  }

  static async createForHomeService(homeRequest, options = {}) {
    const policy = await resolvePatientPolicy(homeRequest.patientId, options.patientInsuranceId);
    const service = homeRequest.service || (await prisma.service.findUnique({ where: { id: homeRequest.serviceId } }));
    const doctorLink = await prisma.doctorService.findFirst({
      where: { serviceId: homeRequest.serviceId, doctor: { verificationStatus: 'APPROVED' } },
      include: { doctor: true },
    });
    const requestedAmount = doctorLink?.doctor?.consultationFee ?? 0;
    const procedure = procedureLabel(null, service);

    const policyNote =
      policy.verificationStatus !== 'VERIFIED'
        ? `[System] Policy verification status: ${policy.verificationStatus}`
        : null;

    const result = await prisma.$transaction(async (tx) => {
      const insuranceCase = await tx.insuranceCase.create({
        data: {
          patientId: homeRequest.patientId,
          homeServiceRequestId: homeRequest.id,
          patientInsuranceId: policy.id,
          providerId: policy.providerId,
          caseType: 'PRE_AUTHORIZATION',
          requestType: 'PROCEDURE',
          status: 'UNDER_REVIEW',
          requestedAmount,
          notes: policyNote,
          externalReference: `HSR-${homeRequest.id}`,
        },
        include: {
          provider: true,
          patient: { include: { user: { select: { id: true, fullName: true } } } },
        },
      });

      await tx.insuranceApproval.create({
        data: {
          insuranceCaseId: insuranceCase.id,
          requestedProcedure: procedure,
          approvalStatus: 'PENDING',
          requestedAmount,
        },
      });

      await tx.homeServiceRequest.update({
        where: { id: homeRequest.id },
        data: {
          insuranceStatus: 'PENDING_VERIFICATION',
          requiresInsuranceApproval: true,
        },
      });

      return insuranceCase;
    });

    const full = await prisma.insuranceCase.findUnique({
      where: { id: result.id },
      include: InsuranceRequestOrchestrator.caseInclude(),
    });

    eventEmitter.emit(EVENTS.INSURANCE.CASE_CREATED, full);
    return full;
  }

  static async syncBookingFromCase(insuranceCase, { approvalStatus, approvedAmount } = {}) {
    const status =
      approvalStatus && APPROVAL_STATUS_TO_INSURANCE[approvalStatus]
        ? APPROVAL_STATUS_TO_INSURANCE[approvalStatus]
        : CASE_STATUS_TO_INSURANCE[insuranceCase.status] || 'PENDING_VERIFICATION';

    const caseId = ['APPROVED', 'PARTIALLY_APPROVED'].includes(status)
      ? insuranceCase.id
      : null;

    if (insuranceCase.appointmentId) {
      await prisma.appointment.update({
        where: { id: insuranceCase.appointmentId },
        data: {
          insuranceStatus: status,
          approvedInsuranceCaseId: caseId,
        },
      });
    }

    if (insuranceCase.homeServiceRequestId) {
      await prisma.homeServiceRequest.update({
        where: { id: insuranceCase.homeServiceRequestId },
        data: {
          insuranceStatus: status,
          approvedInsuranceCaseId: caseId,
        },
      });
    }
  }

  static caseInclude() {
    return {
      provider: true,
      patient: {
        include: {
          user: { select: { id: true, fullName: true, email: true, phone: true } },
          insurances: { include: { provider: true } },
        },
      },
      patientInsurance: { include: { provider: true } },
      appointment: {
        include: {
          doctor: { include: { user: { select: { fullName: true } }, speciality: true } },
          service: true,
        },
      },
      homeServiceRequest: { include: { service: true } },
      approvals: { include: { decider: { select: { fullName: true } } }, orderBy: { createdAt: 'desc' } },
    };
  }
}

module.exports = InsuranceRequestOrchestrator;

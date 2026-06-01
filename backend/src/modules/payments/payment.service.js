const PaymentRepository = require('./payment.repository');
const PatientRepository = require('../patients/patient.repository');
const AppointmentRepository = require('../appointments/appointment.repository');
const HomeServiceService = require('../home-services/home-service.service');
const { BadRequestError } = require('../../shared/errors/AppError');
const { buildPagination } = require('../../utils/pagination');
const paymentProvider = require('../../shared/payments');
const { eventEmitter, EVENTS } = require('../../shared/events/eventEmitter');

class PaymentService {
  static async initiateForPatient(userId, body) {
    return this.initiate(userId, body);
  }

  static async initiate(userId, body) {
    const hasAppointment = body.appointmentId != null;
    const hasHomeService = body.homeServiceRequestId != null;

    if (hasAppointment === hasHomeService) {
      throw new BadRequestError('Provide exactly one of appointmentId or homeServiceRequestId');
    }

    const result = await paymentProvider.initiate({
      amount: body.amount,
      currency: body.currency || 'SAR',
      description: body.description,
    });

    const patient = await PatientRepository.findUnique({ where: { userId } });
    if (!patient) throw new BadRequestError('Patient profile not found');

    if (hasAppointment) {
      const appointment = await AppointmentRepository.findUnique({ where: { id: body.appointmentId } });
      if (!appointment || appointment.patientId !== patient.id) {
        throw new BadRequestError('Appointment not found');
      }
    } else {
      await HomeServiceService.assertPatientOwnsRequest(patient.id, body.homeServiceRequestId);
    }

    const payment = await PaymentRepository.create({
      data: {
        appointmentId: body.appointmentId || null,
        homeServiceRequestId: body.homeServiceRequestId || null,
        patientId: patient.id,
        amount: body.amount,
        currency: body.currency || 'SAR',
        method: body.method || null,
        provider: result.provider,
        transactionReference: result.transactionReference,
        status: 'PENDING',
      },
    });

    return { payment, paymentUrl: result.paymentUrl };
  }

  static async handleWebhook(body) {
    const result = await paymentProvider.handleWebhook(body);

    if (result.transactionReference) {
      const paymentStatus = result.status === 'PAID' ? 'PAID' : 'FAILED';
      await PaymentRepository.model.updateMany({
        where: { transactionReference: result.transactionReference },
        data: {
          status: paymentStatus,
          paidAt: result.status === 'PAID' ? new Date() : null,
          rawPayload: body,
        },
      });

      const payment = await PaymentRepository.findFirst({
        where: { transactionReference: result.transactionReference },
      });

      if (payment) {
        if (result.status === 'PAID') {
          eventEmitter.emit(EVENTS.PAYMENT.COMPLETED, { paymentId: payment.id });
          if (payment.appointmentId) {
            await AppointmentRepository.update({
              where: { id: payment.appointmentId },
              data: { paymentStatus: 'PAID' },
            });
          }
        } else {
          eventEmitter.emit(EVENTS.PAYMENT.FAILED, { paymentId: payment.id });
        }
      }
    }
    return { received: true };
  }

  static async list(userRole, userId, query) {
    const { page, limit, skip } = buildPagination(query);
    const where = {};

    if (userRole === 'PATIENT') {
      const patient = await PatientRepository.findUnique({ where: { userId } });
      where.patientId = patient?.id;
    }
    if (query.status) where.status = query.status;

    const [data, total] = await Promise.all([
      PaymentRepository.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      PaymentRepository.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  static async getById(id) {
    return PaymentRepository.findUnique({ where: { id: parseInt(id) } });
  }
}

module.exports = PaymentService;

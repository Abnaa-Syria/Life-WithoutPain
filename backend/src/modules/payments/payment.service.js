const PaymentRepository = require('./payment.repository');
const PatientRepository = require('../patients/patient.repository');
const AppointmentRepository = require('../appointments/appointment.repository');
const { buildPagination } = require('../../utils/pagination');
const paymentProvider = require('../../shared/payments');

class PaymentService {
  static async initiate(userId, body) {
    const result = await paymentProvider.initiate({
      amount: body.amount,
      currency: body.currency || 'SAR',
      description: body.description,
    });

    const patient = await PatientRepository.findUnique({ where: { userId } });

    const payment = await PaymentRepository.create({
      data: {
        appointmentId: body.appointmentId || null,
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
      await PaymentRepository.model.updateMany({
        where: { transactionReference: result.transactionReference },
        data: {
          status: result.status === 'PAID' ? 'PAID' : 'FAILED',
          paidAt: result.status === 'PAID' ? new Date() : null,
          rawPayload: body,
        },
      });

      if (result.status === 'PAID') {
        const payment = await PaymentRepository.findFirst({ where: { transactionReference: result.transactionReference } });
        if (payment?.appointmentId) {
          await AppointmentRepository.update({ where: { id: payment.appointmentId }, data: { paymentStatus: 'PAID' } });
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

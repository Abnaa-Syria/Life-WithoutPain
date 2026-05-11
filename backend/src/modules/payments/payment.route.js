const router = require('express').Router();
const { authenticate, authorize } = require('../../middlewares/auth');
const { asyncHandler } = require('../../utils/helpers');
const { successResponse, createdResponse, paginatedResponse } = require('../../shared/responses');
const { buildPagination } = require('../../utils/pagination');
const prisma = require('../../config/database');
const { ROLES } = require('../../constants');
const paymentProvider = require('../../shared/payments');

router.post('/initiate', authenticate, asyncHandler(async (req, res) => {
  const result = await paymentProvider.initiate({
    amount: req.body.amount,
    currency: req.body.currency || 'SAR',
    description: req.body.description,
  });

  const patient = await prisma.patientProfile.findUnique({ where: { userId: req.user.id } });

  const payment = await prisma.payment.create({
    data: {
      appointmentId: req.body.appointmentId || null,
      patientId: patient.id,
      amount: req.body.amount,
      currency: req.body.currency || 'SAR',
      method: req.body.method || null,
      provider: result.provider,
      transactionReference: result.transactionReference,
      status: 'PENDING',
    },
  });
  return createdResponse(res, { data: { payment, paymentUrl: result.paymentUrl } });
}));

router.post('/webhook', asyncHandler(async (req, res) => {
  const result = await paymentProvider.handleWebhook(req.body);

  if (result.transactionReference) {
    await prisma.payment.updateMany({
      where: { transactionReference: result.transactionReference },
      data: { status: result.status === 'PAID' ? 'PAID' : 'FAILED', paidAt: result.status === 'PAID' ? new Date() : null, rawPayload: req.body },
    });

    if (result.status === 'PAID') {
      const payment = await prisma.payment.findFirst({ where: { transactionReference: result.transactionReference } });
      if (payment?.appointmentId) {
        await prisma.appointment.update({ where: { id: payment.appointmentId }, data: { paymentStatus: 'PAID' } });
      }
    }
  }
  return successResponse(res, { data: { received: true } });
}));

router.get('/', authenticate, asyncHandler(async (req, res) => {
  const { page, limit, skip } = buildPagination(req.query);
  const where = {};

  if (req.user.role === 'PATIENT') {
    const patient = await prisma.patientProfile.findUnique({ where: { userId: req.user.id } });
    where.patientId = patient?.id;
  }
  if (req.query.status) where.status = req.query.status;

  const [data, total] = await Promise.all([
    prisma.payment.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
    prisma.payment.count({ where }),
  ]);
  return paginatedResponse(res, { data, total, page, limit });
}));

router.get('/:id', authenticate, asyncHandler(async (req, res) => {
  const data = await prisma.payment.findUnique({ where: { id: parseInt(req.params.id) } });
  return successResponse(res, { data });
}));

module.exports = router;

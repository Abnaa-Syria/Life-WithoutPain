const router = require('express').Router();
const { authenticate, authorize } = require('../../middlewares/auth');
const { asyncHandler } = require('../../utils/helpers');
const { successResponse, createdResponse, paginatedResponse } = require('../../shared/responses');
const { buildPagination } = require('../../utils/pagination');
const prisma = require('../../config/database');
const { ROLES } = require('../../constants');
const { NotFoundError, BadRequestError } = require('../../shared/errors/AppError');
const NotificationService = require('../../shared/notifications/NotificationService');
const { createAuditLog } = require('../../middlewares/auditLog');

router.use(authenticate);

router.post('/', authorize(ROLES.PATIENT, ROLES.SUPPORT_STAFF, ROLES.INSURANCE_STAFF, ROLES.SUPER_ADMIN), asyncHandler(async (req, res) => {
  const data = await prisma.insuranceCase.create({
    data: req.body,
    include: { provider: true },
  });
  return createdResponse(res, { data });
}));

router.get('/', authorize(ROLES.SUPER_ADMIN, ROLES.MEDICAL_ADMIN, ROLES.INSURANCE_STAFF, ROLES.SUPPORT_STAFF), asyncHandler(async (req, res) => {
  const { page, limit, skip } = buildPagination(req.query);
  const where = {};
  if (req.query.status) where.status = req.query.status;
  if (req.query.providerId) where.providerId = parseInt(req.query.providerId);
  if (req.query.patientId) where.patientId = parseInt(req.query.patientId);

  const [data, total] = await Promise.all([
    prisma.insuranceCase.findMany({
      where, skip, take: limit, orderBy: { createdAt: 'desc' },
      include: { patient: { include: { user: { select: { fullName: true } } } }, provider: true },
    }),
    prisma.insuranceCase.count({ where }),
  ]);
  return paginatedResponse(res, { data, total, page, limit });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const data = await prisma.insuranceCase.findUnique({
    where: { id: parseInt(req.params.id) },
    include: { patient: { include: { user: { select: { fullName: true, email: true, phone: true } } } }, provider: true, approvals: true, supportCases: true },
  });
  if (!data) throw new NotFoundError('Insurance case not found');
  return successResponse(res, { data });
}));

router.patch('/:id/approve', authorize(ROLES.SUPER_ADMIN, ROLES.INSURANCE_STAFF), asyncHandler(async (req, res) => {
  const insuranceCase = await prisma.insuranceCase.findUnique({ where: { id: parseInt(req.params.id) } });
  if (!insuranceCase) throw new NotFoundError('Insurance case not found');

  const data = await prisma.insuranceCase.update({
    where: { id: parseInt(req.params.id) },
    data: { status: 'APPROVED', resolvedAt: new Date(), notes: req.body.notes },
  });

  if (req.body.approvalData) {
    await prisma.insuranceApproval.create({
      data: {
        insuranceCaseId: data.id,
        requestedProcedure: req.body.approvalData.procedure || 'Consultation',
        approvalStatus: 'APPROVED',
        approvedAmount: req.body.approvalData.amount,
        decisionNotes: req.body.notes,
        decidedBy: req.user.id,
        decidedAt: new Date(),
      },
    });
  }

  createAuditLog({ actorId: req.user.id, entityType: 'InsuranceCase', entityId: data.id, action: 'APPROVE', req });
  return successResponse(res, { data, message: 'Insurance case approved' });
}));

router.patch('/:id/reject', authorize(ROLES.SUPER_ADMIN, ROLES.INSURANCE_STAFF), asyncHandler(async (req, res) => {
  const data = await prisma.insuranceCase.update({
    where: { id: parseInt(req.params.id) },
    data: { status: 'REJECTED', resolvedAt: new Date(), notes: req.body.notes },
  });
  createAuditLog({ actorId: req.user.id, entityType: 'InsuranceCase', entityId: data.id, action: 'REJECT', req });
  return successResponse(res, { data, message: 'Insurance case rejected' });
}));

router.patch('/:id/request-info', authorize(ROLES.SUPER_ADMIN, ROLES.INSURANCE_STAFF), asyncHandler(async (req, res) => {
  const data = await prisma.insuranceCase.update({
    where: { id: parseInt(req.params.id) },
    data: { status: 'MORE_INFO_REQUESTED', notes: req.body.notes },
  });
  return successResponse(res, { data, message: 'More information requested' });
}));

router.patch('/:id/escalate', authorize(ROLES.SUPER_ADMIN, ROLES.SUPPORT_STAFF, ROLES.INSURANCE_STAFF), asyncHandler(async (req, res) => {
  const data = await prisma.insuranceCase.update({
    where: { id: parseInt(req.params.id) },
    data: { status: 'ESCALATED', notes: req.body.notes },
  });
  createAuditLog({ actorId: req.user.id, entityType: 'InsuranceCase', entityId: data.id, action: 'ESCALATE', req });
  return successResponse(res, { data, message: 'Case escalated' });
}));

router.post('/:id/notes', asyncHandler(async (req, res) => {
  const current = await prisma.insuranceCase.findUnique({ where: { id: parseInt(req.params.id) } });
  if (!current) throw new NotFoundError('Insurance case not found');
  const notes = current.notes ? `${current.notes}\n[${new Date().toISOString()}] ${req.body.note}` : `[${new Date().toISOString()}] ${req.body.note}`;
  const data = await prisma.insuranceCase.update({ where: { id: parseInt(req.params.id) }, data: { notes } });
  return successResponse(res, { data });
}));

module.exports = router;

const router = require('express').Router();
const { authenticate, authorize } = require('../../middlewares/auth');
const { asyncHandler } = require('../../utils/helpers');
const { successResponse, createdResponse, paginatedResponse } = require('../../shared/responses');
const { buildPagination } = require('../../utils/pagination');
const prisma = require('../../config/database');
const { ROLES } = require('../../constants');
const { NotFoundError } = require('../../shared/errors/AppError');

router.use(authenticate);

router.post('/', asyncHandler(async (req, res) => {
  const data = await prisma.supportCase.create({ data: req.body });
  return createdResponse(res, { data });
}));

router.get('/', authorize(ROLES.SUPER_ADMIN, ROLES.SUPPORT_STAFF), asyncHandler(async (req, res) => {
  const { page, limit, skip } = buildPagination(req.query);
  const where = {};
  if (req.query.status) where.status = req.query.status;
  if (req.query.type) where.type = req.query.type;
  if (req.query.priority) where.priority = req.query.priority;
  if (req.query.assignedTo) where.assignedTo = parseInt(req.query.assignedTo);

  const [data, total] = await Promise.all([
    prisma.supportCase.findMany({
      where, skip, take: limit, orderBy: { createdAt: 'desc' },
      include: {
        patient: { include: { user: { select: { fullName: true } } } },
        assignee: { select: { fullName: true } },
      },
    }),
    prisma.supportCase.count({ where }),
  ]);
  return paginatedResponse(res, { data, total, page, limit });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const data = await prisma.supportCase.findUnique({
    where: { id: parseInt(req.params.id) },
    include: {
      patient: { include: { user: { select: { fullName: true, email: true, phone: true } } } },
      assignee: { select: { fullName: true } },
      insuranceCase: true,
      messages: { orderBy: { sentAt: 'asc' }, include: { sender: { select: { fullName: true, role: true } } } },
    },
  });
  if (!data) throw new NotFoundError('Support case not found');
  return successResponse(res, { data });
}));

router.patch('/:id/assign', authorize(ROLES.SUPER_ADMIN, ROLES.SUPPORT_STAFF), asyncHandler(async (req, res) => {
  const data = await prisma.supportCase.update({
    where: { id: parseInt(req.params.id) },
    data: { assignedTo: req.body.assignedTo, status: 'IN_PROGRESS' },
  });
  return successResponse(res, { data, message: 'Case assigned' });
}));

router.patch('/:id/status', authorize(ROLES.SUPER_ADMIN, ROLES.SUPPORT_STAFF), asyncHandler(async (req, res) => {
  const updateData = { status: req.body.status };
  if (req.body.status === 'RESOLVED' || req.body.status === 'CLOSED') {
    updateData.resolutionNotes = req.body.resolutionNotes;
  }
  const data = await prisma.supportCase.update({ where: { id: parseInt(req.params.id) }, data: updateData });
  return successResponse(res, { data, message: 'Status updated' });
}));

router.get('/:id/messages', asyncHandler(async (req, res) => {
  const data = await prisma.supportMessage.findMany({
    where: { supportCaseId: parseInt(req.params.id) },
    orderBy: { sentAt: 'asc' },
    include: { sender: { select: { fullName: true, role: true, avatarUrl: true } } },
  });
  return successResponse(res, { data });
}));

router.post('/:id/messages', asyncHandler(async (req, res) => {
  const data = await prisma.supportMessage.create({
    data: {
      supportCaseId: parseInt(req.params.id),
      senderId: req.user.id,
      messageType: req.body.messageType || 'TEXT',
      content: req.body.content,
      attachmentUrl: req.body.attachmentUrl || null,
    },
    include: { sender: { select: { fullName: true, role: true } } },
  });
  return createdResponse(res, { data });
}));

module.exports = router;

const router = require('express').Router();
const { authenticate } = require('../../middlewares/auth');
const { asyncHandler } = require('../../utils/helpers');
const { successResponse, createdResponse, paginatedResponse } = require('../../shared/responses');
const { buildPagination } = require('../../utils/pagination');
const prisma = require('../../config/database');
const { NotFoundError } = require('../../shared/errors/AppError');

router.use(authenticate);

router.get('/', asyncHandler(async (req, res) => {
  const { page, limit, skip } = buildPagination(req.query);
  const userId = req.user.id;

  const patientProfile = await prisma.patientProfile.findUnique({ where: { userId } });
  const doctorProfile = await prisma.doctorProfile.findUnique({ where: { userId } });

  const where = {};
  if (patientProfile) where.patientId = patientProfile.id;
  else if (doctorProfile) where.doctorId = doctorProfile.id;

  const [data, total] = await Promise.all([
    prisma.conversation.findMany({
      where, skip, take: limit, orderBy: { updatedAt: 'desc' },
      include: {
        patient: { include: { user: { select: { fullName: true, avatarUrl: true } } } },
        doctor: { include: { user: { select: { fullName: true, avatarUrl: true } } } },
        messages: { take: 1, orderBy: { sentAt: 'desc' } },
      },
    }),
    prisma.conversation.count({ where }),
  ]);
  return paginatedResponse(res, { data, total, page, limit });
}));

router.post('/', asyncHandler(async (req, res) => {
  const data = await prisma.conversation.create({
    data: {
      patientId: req.body.patientId,
      doctorId: req.body.doctorId,
      appointmentId: req.body.appointmentId || null,
    },
  });
  return createdResponse(res, { data });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const data = await prisma.conversation.findUnique({
    where: { id: parseInt(req.params.id) },
    include: {
      patient: { include: { user: { select: { fullName: true, avatarUrl: true } } } },
      doctor: { include: { user: { select: { fullName: true, avatarUrl: true } } } },
    },
  });
  if (!data) throw new NotFoundError('Conversation not found');
  return successResponse(res, { data });
}));

router.get('/:id/messages', asyncHandler(async (req, res) => {
  const { page, limit, skip } = buildPagination(req.query);
  const where = { conversationId: parseInt(req.params.id) };

  const [data, total] = await Promise.all([
    prisma.message.findMany({
      where, skip, take: limit, orderBy: { sentAt: 'desc' },
      include: { sender: { select: { fullName: true, avatarUrl: true, role: true } } },
    }),
    prisma.message.count({ where }),
  ]);
  return paginatedResponse(res, { data, total, page, limit });
}));

router.post('/:id/messages', asyncHandler(async (req, res) => {
  const data = await prisma.message.create({
    data: {
      conversationId: parseInt(req.params.id),
      senderId: req.user.id,
      messageType: req.body.messageType || 'TEXT',
      content: req.body.content,
      attachmentUrl: req.body.attachmentUrl || null,
    },
    include: { sender: { select: { fullName: true, avatarUrl: true } } },
  });
  await prisma.conversation.update({ where: { id: parseInt(req.params.id) }, data: { updatedAt: new Date() } });
  return createdResponse(res, { data });
}));

router.patch('/:id/messages/:messageId/read', asyncHandler(async (req, res) => {
  const data = await prisma.message.update({
    where: { id: parseInt(req.params.messageId) },
    data: { readAt: new Date() },
  });
  return successResponse(res, { data });
}));

module.exports = router;

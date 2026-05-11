const router = require('express').Router();
const { authenticate, authorize } = require('../../middlewares/auth');
const { asyncHandler } = require('../../utils/helpers');
const { successResponse, createdResponse, paginatedResponse } = require('../../shared/responses');
const { buildPagination } = require('../../utils/pagination');
const prisma = require('../../config/database');
const { ROLES } = require('../../constants');

router.use(authenticate);

router.get('/', asyncHandler(async (req, res) => {
  const { page, limit, skip } = buildPagination(req.query);
  const where = { userId: req.user.id };
  if (req.query.isRead !== undefined) where.isRead = req.query.isRead === 'true';

  const [data, total] = await Promise.all([
    prisma.notification.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
    prisma.notification.count({ where }),
  ]);
  return paginatedResponse(res, { data, total, page, limit });
}));

router.patch('/:id/read', asyncHandler(async (req, res) => {
  await prisma.notification.updateMany({
    where: { id: parseInt(req.params.id), userId: req.user.id },
    data: { isRead: true, readAt: new Date() },
  });
  return successResponse(res, { data: null, message: 'Notification marked as read' });
}));

router.patch('/read-all', asyncHandler(async (req, res) => {
  await prisma.notification.updateMany({
    where: { userId: req.user.id, isRead: false },
    data: { isRead: true, readAt: new Date() },
  });
  return successResponse(res, { data: null, message: 'All notifications marked as read' });
}));

module.exports = router;

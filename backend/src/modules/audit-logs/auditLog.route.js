const router = require('express').Router();
const { authenticate, authorize } = require('../../middlewares/auth');
const { asyncHandler } = require('../../utils/helpers');
const { paginatedResponse } = require('../../shared/responses');
const { buildPagination } = require('../../utils/pagination');
const prisma = require('../../config/database');
const { ROLES } = require('../../constants');

router.use(authenticate);
router.use(authorize(ROLES.SUPER_ADMIN));

router.get('/', asyncHandler(async (req, res) => {
  const { page, limit, skip } = buildPagination(req.query);
  const where = {};
  if (req.query.entityType) where.entityType = req.query.entityType;
  if (req.query.action) where.action = req.query.action;
  if (req.query.actorId) where.actorId = parseInt(req.query.actorId);
  if (req.query.startDate || req.query.endDate) {
    where.createdAt = {};
    if (req.query.startDate) where.createdAt.gte = new Date(req.query.startDate);
    if (req.query.endDate) where.createdAt.lte = new Date(req.query.endDate);
  }

  const [data, total] = await Promise.all([
    prisma.auditLog.findMany({
      where, skip, take: limit, orderBy: { createdAt: 'desc' },
      include: { actor: { select: { fullName: true, email: true, role: true } } },
    }),
    prisma.auditLog.count({ where }),
  ]);
  return paginatedResponse(res, { data, total, page, limit });
}));

module.exports = router;

const router = require('express').Router();
const { authenticate, authorize } = require('../../middlewares/auth');
const { asyncHandler } = require('../../utils/helpers');
const { successResponse, createdResponse, paginatedResponse } = require('../../shared/responses');
const { buildPagination } = require('../../utils/pagination');
const prisma = require('../../config/database');
const { ROLES } = require('../../constants');

router.use(authenticate);
router.use(authorize(ROLES.SUPER_ADMIN, ROLES.ACCOUNTANT));

router.get('/', asyncHandler(async (req, res) => {
  const { page, limit, skip } = buildPagination(req.query);
  const where = {};
  if (req.query.status) where.status = req.query.status;
  if (req.query.providerId) where.providerId = parseInt(req.query.providerId);

  const [data, total] = await Promise.all([
    prisma.reconciliation.findMany({
      where, skip, take: limit, orderBy: { recordedAt: 'desc' },
      include: { provider: { select: { nameAr: true, nameEn: true } } },
    }),
    prisma.reconciliation.count({ where }),
  ]);
  return paginatedResponse(res, { data, total, page, limit });
}));

router.post('/', asyncHandler(async (req, res) => {
  const data = await prisma.reconciliation.create({ data: req.body });
  return createdResponse(res, { data });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const data = await prisma.reconciliation.findUnique({
    where: { id: parseInt(req.params.id) },
    include: { provider: true, claimBatch: true },
  });
  return successResponse(res, { data });
}));

module.exports = router;

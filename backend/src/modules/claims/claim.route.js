const router = require('express').Router();
const { authenticate, authorize } = require('../../middlewares/auth');
const { asyncHandler } = require('../../utils/helpers');
const { successResponse, createdResponse, paginatedResponse } = require('../../shared/responses');
const { buildPagination } = require('../../utils/pagination');
const prisma = require('../../config/database');
const { ROLES } = require('../../constants');

router.use(authenticate);
router.use(authorize(ROLES.SUPER_ADMIN, ROLES.ACCOUNTANT));

router.post('/batches', asyncHandler(async (req, res) => {
  const batch = await prisma.claimBatch.create({ data: req.body });
  return createdResponse(res, { data: batch });
}));

router.get('/batches', asyncHandler(async (req, res) => {
  const { page, limit, skip } = buildPagination(req.query);
  const where = {};
  if (req.query.status) where.status = req.query.status;
  if (req.query.providerId) where.providerId = parseInt(req.query.providerId);

  const [data, total] = await Promise.all([
    prisma.claimBatch.findMany({
      where, skip, take: limit, orderBy: { createdAt: 'desc' },
      include: { provider: { select: { nameAr: true, nameEn: true } }, _count: { select: { items: true } } },
    }),
    prisma.claimBatch.count({ where }),
  ]);
  return paginatedResponse(res, { data, total, page, limit });
}));

router.get('/batches/:id', asyncHandler(async (req, res) => {
  const data = await prisma.claimBatch.findUnique({
    where: { id: parseInt(req.params.id) },
    include: { provider: true, items: { include: { appointment: true } } },
  });
  return successResponse(res, { data });
}));

router.patch('/batches/:id/submit', asyncHandler(async (req, res) => {
  const data = await prisma.claimBatch.update({
    where: { id: parseInt(req.params.id) },
    data: { status: 'SUBMITTED', submittedAt: new Date() },
  });
  return successResponse(res, { data, message: 'Batch submitted' });
}));

router.get('/items', asyncHandler(async (req, res) => {
  const { page, limit, skip } = buildPagination(req.query);
  const where = {};
  if (req.query.claimBatchId) where.claimBatchId = parseInt(req.query.claimBatchId);
  if (req.query.status) where.status = req.query.status;

  const [data, total] = await Promise.all([
    prisma.claimItem.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
    prisma.claimItem.count({ where }),
  ]);
  return paginatedResponse(res, { data, total, page, limit });
}));

module.exports = router;

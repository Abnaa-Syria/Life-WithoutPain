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
  if (req.query.doctorId) where.doctorId = parseInt(req.query.doctorId);

  const [data, total] = await Promise.all([
    prisma.doctorPayout.findMany({
      where, skip, take: limit, orderBy: { createdAt: 'desc' },
      include: { doctor: { include: { user: { select: { fullName: true } } } } },
    }),
    prisma.doctorPayout.count({ where }),
  ]);
  return paginatedResponse(res, { data, total, page, limit });
}));

router.post('/', asyncHandler(async (req, res) => {
  const data = await prisma.doctorPayout.create({ data: req.body });
  return createdResponse(res, { data });
}));

router.patch('/:id/pay', asyncHandler(async (req, res) => {
  const data = await prisma.doctorPayout.update({
    where: { id: parseInt(req.params.id) },
    data: { status: 'PAID', paidAt: new Date() },
  });
  return successResponse(res, { data, message: 'Payout marked as paid' });
}));

module.exports = router;

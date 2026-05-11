const router = require('express').Router();
const { authenticate, authorize } = require('../../middlewares/auth');
const { asyncHandler } = require('../../utils/helpers');
const { successResponse, createdResponse, paginatedResponse } = require('../../shared/responses');
const { buildPagination } = require('../../utils/pagination');
const prisma = require('../../config/database');
const { ROLES } = require('../../constants');
const { NotFoundError } = require('../../shared/errors/AppError');

router.get('/', asyncHandler(async (req, res) => {
  const { page, limit, skip } = buildPagination(req.query);
  const where = {};
  if (req.query.search) where.OR = [{ nameAr: { contains: req.query.search } }, { nameEn: { contains: req.query.search } }];
  if (req.query.isActive !== undefined) where.isActive = req.query.isActive === 'true';

  const [data, total] = await Promise.all([
    prisma.speciality.findMany({ where, skip, take: limit, orderBy: { sortOrder: 'asc' } }),
    prisma.speciality.count({ where }),
  ]);
  return paginatedResponse(res, { data, total, page, limit });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const data = await prisma.speciality.findUnique({ where: { id: parseInt(req.params.id) } });
  if (!data) throw new NotFoundError('Speciality not found');
  return successResponse(res, { data });
}));

router.post('/', authenticate, authorize(ROLES.SUPER_ADMIN, ROLES.MEDICAL_ADMIN), asyncHandler(async (req, res) => {
  const data = await prisma.speciality.create({ data: req.body });
  return createdResponse(res, { data });
}));

router.put('/:id', authenticate, authorize(ROLES.SUPER_ADMIN, ROLES.MEDICAL_ADMIN), asyncHandler(async (req, res) => {
  const data = await prisma.speciality.update({ where: { id: parseInt(req.params.id) }, data: req.body });
  return successResponse(res, { data });
}));

router.delete('/:id', authenticate, authorize(ROLES.SUPER_ADMIN), asyncHandler(async (req, res) => {
  await prisma.speciality.delete({ where: { id: parseInt(req.params.id) } });
  return successResponse(res, { data: null, message: 'Speciality deleted' });
}));

module.exports = router;

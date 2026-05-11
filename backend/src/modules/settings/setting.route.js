const router = require('express').Router();
const { authenticate, authorize } = require('../../middlewares/auth');
const { asyncHandler } = require('../../utils/helpers');
const { successResponse, createdResponse, paginatedResponse } = require('../../shared/responses');
const prisma = require('../../config/database');
const { ROLES } = require('../../constants');
const { NotFoundError } = require('../../shared/errors/AppError');

router.get('/', asyncHandler(async (req, res) => {
  const isAdmin = req.headers.authorization;
  const where = isAdmin ? {} : { isPublic: true };
  const data = await prisma.systemSetting.findMany({ where, orderBy: { key: 'asc' } });
  return successResponse(res, { data });
}));

router.post('/', authenticate, authorize(ROLES.SUPER_ADMIN), asyncHandler(async (req, res) => {
  const data = await prisma.systemSetting.create({ data: req.body });
  return createdResponse(res, { data });
}));

router.put('/:id', authenticate, authorize(ROLES.SUPER_ADMIN), asyncHandler(async (req, res) => {
  const data = await prisma.systemSetting.update({ where: { id: parseInt(req.params.id) }, data: req.body });
  return successResponse(res, { data });
}));

router.delete('/:id', authenticate, authorize(ROLES.SUPER_ADMIN), asyncHandler(async (req, res) => {
  await prisma.systemSetting.delete({ where: { id: parseInt(req.params.id) } });
  return successResponse(res, { data: null, message: 'Setting deleted' });
}));

module.exports = router;

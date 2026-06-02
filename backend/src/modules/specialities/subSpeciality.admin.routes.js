const router = require('express').Router({ mergeParams: true });
const { authenticate } = require('../../middlewares/auth');
const { guard, MEDICAL, SUPER } = require('../admin/admin.permissions');
const SubSpecialityService = require('./subSpeciality.service');
const { successResponse, createdResponse, paginatedResponse } = require('../../shared/responses');
const { asyncHandler } = require('../../utils/helpers');

router.use(authenticate);

router.get('/', guard('specialities.list', ...MEDICAL), asyncHandler(async (req, res) => {
  const { data, total, page, limit } = await SubSpecialityService.listForAdmin(req.params.specialityId, req.query);
  return paginatedResponse(res, { data, total, page, limit });
}));

router.post('/', guard('specialities.create', ...MEDICAL), asyncHandler(async (req, res) => {
  const data = await SubSpecialityService.createForAdmin(req.params.specialityId, req.body);
  return createdResponse(res, { data });
}));

router.put('/:id', guard('specialities.update', ...MEDICAL), asyncHandler(async (req, res) => {
  const data = await SubSpecialityService.updateForAdmin(req.params.specialityId, req.params.id, req.body);
  return successResponse(res, { data });
}));

router.delete('/:id', guard('specialities.delete', ...SUPER), asyncHandler(async (req, res) => {
  await SubSpecialityService.deleteForAdmin(req.params.specialityId, req.params.id);
  return successResponse(res, { data: null, message: 'Sub-speciality deleted' });
}));

module.exports = router;

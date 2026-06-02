const router = require('express').Router();
const SpecialityService = require('./speciality.service');
const { successResponse } = require('../../shared/responses');
const { asyncHandler } = require('../../utils/helpers');

router.get('/', asyncHandler(async (req, res) => {
  const { data } = await SpecialityService.list({ ...req.query, limit: 100, isActive: 'true' }, { activeOnly: true, includeSubs: true });
  return successResponse(res, { data });
}));

router.use('/sub-specializations', require('./subSpeciality.doctor.routes'));

module.exports = router;

const router = require('express').Router();
const SpecialityService = require('./speciality.service');
const { successResponse } = require('../../shared/responses');
const { asyncHandler } = require('../../utils/helpers');
const { mapSpecializations } = require('../../shared/utils/doctorAppMappers');

router.get('/', asyncHandler(async (req, res) => {
  const { data } = await SpecialityService.list({ ...req.query, limit: 100 });
  return successResponse(res, { data: mapSpecializations(data) });
}));

module.exports = router;

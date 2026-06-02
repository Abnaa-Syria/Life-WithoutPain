const router = require('express').Router();
const SubSpecialityService = require('./subSpeciality.service');
const { paginatedResponse } = require('../../shared/responses');
const { asyncHandler } = require('../../utils/helpers');

router.get('/', asyncHandler(async (req, res) => {
  const { data, total, page, limit } = await SubSpecialityService.listBySpecialityIds(req.query);
  return paginatedResponse(res, { data, total, page, limit });
}));

module.exports = router;

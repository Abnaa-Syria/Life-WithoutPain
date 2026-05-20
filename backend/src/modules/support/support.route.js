const router = require('express').Router();
const SupportInfoService = require('./supportInfo.service');
const { successResponse } = require('../../shared/responses');
const { asyncHandler } = require('../../utils/helpers');

router.get('/info', asyncHandler(async (req, res) => {
  const lang = req.query.lang || req.headers['accept-language']?.slice(0, 2) || 'ar';
  const data = await SupportInfoService.getPublicInfo(lang === 'en' ? 'en' : 'ar');
  return successResponse(res, { data });
}));

module.exports = router;

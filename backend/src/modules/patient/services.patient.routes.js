const router = require('express').Router();
const ServiceService = require('../services/service.service');
const { successResponse, paginatedResponse } = require('../../shared/responses');
const { asyncHandler } = require('../../utils/helpers');

router.get('/', asyncHandler(async (req, res) => {
  const { data, total, page, limit } = await ServiceService.list({ ...req.query, isActive: 'true' });
  return paginatedResponse(res, { data, total, page, limit });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const data = await ServiceService.getById(req.params.id);
  return successResponse(res, { data });
}));

module.exports = router;

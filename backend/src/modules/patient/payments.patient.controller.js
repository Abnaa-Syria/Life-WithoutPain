const PaymentService = require('../payments/payment.service');
const { successResponse, createdResponse, paginatedResponse } = require('../../shared/responses');
const { asyncHandler } = require('../../utils/helpers');

const initiate = asyncHandler(async (req, res) => {
  const data = await PaymentService.initiateForPatient(req.user.id, req.body);
  return createdResponse(res, { data });
});

const list = asyncHandler(async (req, res) => {
  const { data, total, page, limit } = await PaymentService.list(req.user.role, req.user.id, req.query);
  return paginatedResponse(res, { data, total, page, limit });
});

const getById = asyncHandler(async (req, res) => {
  const data = await PaymentService.getById(req.params.id);
  return successResponse(res, { data });
});

module.exports = { initiate, list, getById };

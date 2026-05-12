const PaymentService = require('./payment.service');
const { successResponse, createdResponse, paginatedResponse } = require('../../shared/responses');
const { asyncHandler } = require('../../utils/helpers');

class PaymentController {
  static initiate = asyncHandler(async (req, res) => {
    const data = await PaymentService.initiate(req.user.id, req.body);
    return createdResponse(res, { data });
  });

  static webhook = asyncHandler(async (req, res) => {
    const data = await PaymentService.handleWebhook(req.body);
    return successResponse(res, { data });
  });

  static list = asyncHandler(async (req, res) => {
    const { data, total, page, limit } = await PaymentService.list(req.user.role, req.user.id, req.query);
    return paginatedResponse(res, { data, total, page, limit });
  });

  static getById = asyncHandler(async (req, res) => {
    const data = await PaymentService.getById(req.params.id);
    return successResponse(res, { data });
  });
}

module.exports = PaymentController;

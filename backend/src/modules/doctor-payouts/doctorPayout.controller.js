const DoctorPayoutService = require('./doctorPayout.service');
const { successResponse, createdResponse, paginatedResponse } = require('../../shared/responses');
const { asyncHandler } = require('../../utils/helpers');

class DoctorPayoutController {
  static list = asyncHandler(async (req, res) => {
    const { data, total, page, limit } = await DoctorPayoutService.list(req.query);
    return paginatedResponse(res, { data, total, page, limit });
  });

  static create = asyncHandler(async (req, res) => {
    const data = await DoctorPayoutService.create(req.body);
    return createdResponse(res, { data });
  });

  static markPaid = asyncHandler(async (req, res) => {
    const data = await DoctorPayoutService.markPaid(req.params.id);
    return successResponse(res, { data, message: 'Payout marked as paid' });
  });
}

module.exports = DoctorPayoutController;

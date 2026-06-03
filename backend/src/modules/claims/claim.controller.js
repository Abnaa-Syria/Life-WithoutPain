const ClaimService = require('./claim.service');
const { successResponse, createdResponse, paginatedResponse } = require('../../shared/responses');
const { asyncHandler } = require('../../utils/helpers');

class ClaimController {
  static createBatch = asyncHandler(async (req, res) => {
    const data = await ClaimService.createBatch(req.body);
    return createdResponse(res, { data });
  });

  static listBatches = asyncHandler(async (req, res) => {
    const { data, total, page, limit } = await ClaimService.listBatches(req.query);
    return paginatedResponse(res, { data, total, page, limit });
  });

  static getBatchById = asyncHandler(async (req, res) => {
    const data = await ClaimService.getBatchById(req.params.id);
    return successResponse(res, { data });
  });

  static submitBatch = asyncHandler(async (req, res) => {
    const data = await ClaimService.submitBatch(req.params.id);
    return successResponse(res, { data, messageKey: 'BATCH_SUBMITTED' });
  });

  static listItems = asyncHandler(async (req, res) => {
    const { data, total, page, limit } = await ClaimService.listItems(req.query);
    return paginatedResponse(res, { data, total, page, limit });
  });
}

module.exports = ClaimController;

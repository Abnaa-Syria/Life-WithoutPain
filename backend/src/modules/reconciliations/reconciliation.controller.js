const ReconciliationService = require('./reconciliation.service');
const { successResponse, createdResponse, paginatedResponse } = require('../../shared/responses');
const { asyncHandler } = require('../../utils/helpers');

class ReconciliationController {
  static list = asyncHandler(async (req, res) => {
    const { data, total, page, limit } = await ReconciliationService.list(req.query);
    return paginatedResponse(res, { data, total, page, limit });
  });

  static create = asyncHandler(async (req, res) => {
    const data = await ReconciliationService.create(req.body);
    return createdResponse(res, { data });
  });

  static getById = asyncHandler(async (req, res) => {
    const data = await ReconciliationService.getById(req.params.id);
    return successResponse(res, { data });
  });
}

module.exports = ReconciliationController;

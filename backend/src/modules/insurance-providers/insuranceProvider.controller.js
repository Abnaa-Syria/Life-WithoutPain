const InsuranceProviderService = require('./insuranceProvider.service');
const { successResponse, createdResponse, paginatedResponse } = require('../../shared/responses');
const { asyncHandler } = require('../../utils/helpers');

class InsuranceProviderController {
  static list = asyncHandler(async (req, res) => {
    const { data, total, page, limit } = await InsuranceProviderService.list(req.query);
    return paginatedResponse(res, { data, total, page, limit });
  });

  static getById = asyncHandler(async (req, res) => {
    const data = await InsuranceProviderService.getById(req.params.id);
    return successResponse(res, { data });
  });

  static create = asyncHandler(async (req, res) => {
    const data = await InsuranceProviderService.create(req.body);
    return createdResponse(res, { data });
  });

  static update = asyncHandler(async (req, res) => {
    const data = await InsuranceProviderService.update(req.params.id, req.body);
    return successResponse(res, { data });
  });

  static delete = asyncHandler(async (req, res) => {
    await InsuranceProviderService.delete(req.params.id);
    return successResponse(res, { data: null, messageKey: 'PROVIDER_DELETED' });
  });
}

module.exports = InsuranceProviderController;

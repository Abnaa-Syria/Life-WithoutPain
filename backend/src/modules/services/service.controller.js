const ServiceService = require('./service.service');
const { successResponse, createdResponse, paginatedResponse } = require('../../shared/responses');
const { asyncHandler } = require('../../utils/helpers');

class ServiceController {
  static list = asyncHandler(async (req, res) => {
    const { data, total, page, limit } = await ServiceService.list(req.query);
    return paginatedResponse(res, { data, total, page, limit });
  });

  static getById = asyncHandler(async (req, res) => {
    const data = await ServiceService.getById(req.params.id);
    return successResponse(res, { data });
  });

  static create = asyncHandler(async (req, res) => {
    const data = await ServiceService.create(req.body);
    return createdResponse(res, { data });
  });

  static update = asyncHandler(async (req, res) => {
    const data = await ServiceService.update(req.params.id, req.body);
    return successResponse(res, { data });
  });

  static delete = asyncHandler(async (req, res) => {
    await ServiceService.delete(req.params.id);
    return successResponse(res, { data: null, messageKey: 'SERVICE_DELETED' });
  });
}

module.exports = ServiceController;

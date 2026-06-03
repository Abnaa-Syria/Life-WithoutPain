const SpecialityService = require('./speciality.service');
const { successResponse, createdResponse, paginatedResponse } = require('../../shared/responses');
const { asyncHandler } = require('../../utils/helpers');

class SpecialityController {
  static list = asyncHandler(async (req, res) => {
    const { data, total, page, limit } = await SpecialityService.list(req.query);
    return paginatedResponse(res, { data, total, page, limit });
  });

  static getById = asyncHandler(async (req, res) => {
    const data = await SpecialityService.getById(req.params.id);
    return successResponse(res, { data });
  });

  static create = asyncHandler(async (req, res) => {
    const data = await SpecialityService.create(req.body);
    return createdResponse(res, { data });
  });

  static update = asyncHandler(async (req, res) => {
    const data = await SpecialityService.update(req.params.id, req.body);
    return successResponse(res, { data });
  });

  static delete = asyncHandler(async (req, res) => {
    await SpecialityService.delete(req.params.id);
    return successResponse(res, { data: null, messageKey: 'SPECIALITY_DELETED' });
  });
}

module.exports = SpecialityController;

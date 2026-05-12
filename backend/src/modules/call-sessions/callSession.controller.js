const CallSessionService = require('./callSession.service');
const { successResponse, createdResponse } = require('../../shared/responses');
const { asyncHandler } = require('../../utils/helpers');

class CallSessionController {
  static create = asyncHandler(async (req, res) => {
    const data = await CallSessionService.create(req.body);
    return createdResponse(res, { data });
  });

  static getById = asyncHandler(async (req, res) => {
    const data = await CallSessionService.getById(req.params.id);
    return successResponse(res, { data });
  });

  static start = asyncHandler(async (req, res) => {
    const data = await CallSessionService.start(req.params.id);
    return successResponse(res, { data });
  });

  static end = asyncHandler(async (req, res) => {
    const data = await CallSessionService.end(req.params.id);
    return successResponse(res, { data });
  });
}

module.exports = CallSessionController;

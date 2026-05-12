const SupportCaseService = require('./supportCase.service');
const { successResponse, createdResponse, paginatedResponse } = require('../../shared/responses');
const { asyncHandler } = require('../../utils/helpers');

class SupportCaseController {
  static create = asyncHandler(async (req, res) => {
    const data = await SupportCaseService.create(req.body);
    return createdResponse(res, { data });
  });

  static list = asyncHandler(async (req, res) => {
    const { data, total, page, limit } = await SupportCaseService.list(req.query);
    return paginatedResponse(res, { data, total, page, limit });
  });

  static getById = asyncHandler(async (req, res) => {
    const data = await SupportCaseService.getById(req.params.id);
    return successResponse(res, { data });
  });

  static assign = asyncHandler(async (req, res) => {
    const data = await SupportCaseService.assign(req.params.id, req.body.assignedTo);
    return successResponse(res, { data, message: 'Case assigned' });
  });

  static updateStatus = asyncHandler(async (req, res) => {
    const data = await SupportCaseService.updateStatus(req.params.id, req.body);
    return successResponse(res, { data, message: 'Status updated' });
  });

  static getMessages = asyncHandler(async (req, res) => {
    const data = await SupportCaseService.getMessages(req.params.id);
    return successResponse(res, { data });
  });

  static addMessage = asyncHandler(async (req, res) => {
    const data = await SupportCaseService.addMessage(req.params.id, req.user.id, req.body);
    return createdResponse(res, { data });
  });
}

module.exports = SupportCaseController;

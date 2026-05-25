const InsuranceCaseService = require('./insuranceCase.service');
const { successResponse, createdResponse, paginatedResponse } = require('../../shared/responses');
const { asyncHandler } = require('../../utils/helpers');

class InsuranceCaseController {
  static create = asyncHandler(async (req, res) => {
    const data = await InsuranceCaseService.create(req.body);
    return createdResponse(res, { data });
  });

  static list = asyncHandler(async (req, res) => {
    const { data, total, page, limit } = await InsuranceCaseService.list(req.query);
    return paginatedResponse(res, { data, total, page, limit });
  });

  static getById = asyncHandler(async (req, res) => {
    const data = await InsuranceCaseService.getById(req.params.id);
    return successResponse(res, { data });
  });

  static approve = asyncHandler(async (req, res) => {
    const data = await InsuranceCaseService.approve(req.params.id, req.body, req.user.id, req);
    return successResponse(res, { data, message: 'Insurance case approved' });
  });

  static reject = asyncHandler(async (req, res) => {
    const data = await InsuranceCaseService.reject(req.params.id, req.body, req.user.id, req);
    return successResponse(res, { data, message: 'Insurance case rejected' });
  });

  static requestInfo = asyncHandler(async (req, res) => {
    const data = await InsuranceCaseService.requestInfo(req.params.id, req.body, req.user.id, req);
    return successResponse(res, { data, message: 'More information requested' });
  });

  static updateApproval = asyncHandler(async (req, res) => {
    const data = await InsuranceCaseService.updateApproval(req.params.id, req.body, req.user.id, req);
    return successResponse(res, { data, message: 'Insurance approval updated' });
  });

  static escalate = asyncHandler(async (req, res) => {
    const data = await InsuranceCaseService.escalate(req.params.id, req.body, req.user.id, req);
    return successResponse(res, { data, message: 'Case escalated' });
  });

  static addNote = asyncHandler(async (req, res) => {
    const data = await InsuranceCaseService.addNote(req.params.id, req.body.note);
    return successResponse(res, { data });
  });
}

module.exports = InsuranceCaseController;

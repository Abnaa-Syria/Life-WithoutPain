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
    return successResponse(res, { data, messageKey: 'INSURANCE_CASE_APPROVED' });
  });

  static reject = asyncHandler(async (req, res) => {
    const data = await InsuranceCaseService.reject(req.params.id, req.body, req.user.id, req);
    return successResponse(res, { data, messageKey: 'INSURANCE_CASE_REJECTED' });
  });

  static requestInfo = asyncHandler(async (req, res) => {
    const data = await InsuranceCaseService.requestInfo(req.params.id, req.body, req.user.id, req);
    return successResponse(res, { data, messageKey: 'INSURANCE_MORE_INFO' });
  });

  static updateApproval = asyncHandler(async (req, res) => {
    const data = await InsuranceCaseService.updateApproval(req.params.id, req.body, req.user.id, req);
    return successResponse(res, { data, messageKey: 'INSURANCE_APPROVAL_UPDATED' });
  });

  static escalate = asyncHandler(async (req, res) => {
    const data = await InsuranceCaseService.escalate(req.params.id, req.body, req.user.id, req);
    return successResponse(res, { data, messageKey: 'CASE_ESCALATED' });
  });

  static addNote = asyncHandler(async (req, res) => {
    const data = await InsuranceCaseService.addNote(req.params.id, req.body.note);
    return successResponse(res, { data });
  });
}

module.exports = InsuranceCaseController;

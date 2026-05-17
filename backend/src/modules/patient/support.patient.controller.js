const SupportCaseService = require('../support-cases/supportCase.service');
const { successResponse, createdResponse, paginatedResponse } = require('../../shared/responses');
const { asyncHandler } = require('../../utils/helpers');

const listCases = asyncHandler(async (req, res) => {
  const { data, total, page, limit } = await SupportCaseService.listForPatient(req.user.id, req.query);
  return paginatedResponse(res, { data, total, page, limit });
});

const createCase = asyncHandler(async (req, res) => {
  const data = await SupportCaseService.createForPatient(req.user.id, req.body);
  return createdResponse(res, { data });
});

const getCase = asyncHandler(async (req, res) => {
  const data = await SupportCaseService.getByIdForPatient(req.user.id, req.params.id);
  return successResponse(res, { data });
});

const getMessages = asyncHandler(async (req, res) => {
  const data = await SupportCaseService.getMessages(req.params.id);
  return successResponse(res, { data });
});

const addMessage = asyncHandler(async (req, res) => {
  const data = await SupportCaseService.addMessage(req.params.id, req.user.id, req.body);
  return createdResponse(res, { data });
});

module.exports = { listCases, createCase, getCase, getMessages, addMessage };

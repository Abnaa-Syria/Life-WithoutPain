const ReportService = require('./report.service');
const { successResponse, createdResponse, paginatedResponse } = require('../../shared/responses');
const { asyncHandler } = require('../../utils/helpers');

const list = asyncHandler(async (req, res) => {
  const { data, total, page, limit } = await ReportService.listForDoctor(req.user.id, req.query);
  return paginatedResponse(res, { data, total, page, limit });
});

const create = asyncHandler(async (req, res) => {
  const data = await ReportService.createForDoctor(req.user.id, req.body);
  return createdResponse(res, { data, messageKey: 'REPORT_CREATED' });
});

const getOne = asyncHandler(async (req, res) => {
  const data = await ReportService.getByIdForDoctor(req.user.id, req.params.id);
  return successResponse(res, { data });
});

const getPdf = asyncHandler(async (req, res) => {
  const pdfUrl = await ReportService.getPdfForDoctor(req.user.id, req.params.id);
  return successResponse(res, { data: { pdfUrl } });
});

module.exports = { list, create, getOne, getPdf };

const ReportService = require('./report.service');
const { successResponse, createdResponse } = require('../../shared/responses');
const { asyncHandler } = require('../../utils/helpers');

const create = asyncHandler(async (req, res) => {
  const data = await ReportService.createForDoctor(req.user.id, req.body);
  return createdResponse(res, { data, message: 'Report created' });
});

const getOne = asyncHandler(async (req, res) => {
  const data = await ReportService.getByIdForDoctor(req.user.id, req.params.id);
  return successResponse(res, { data });
});

const getPdf = asyncHandler(async (req, res) => {
  const pdfUrl = await ReportService.getPdfForDoctor(req.user.id, req.params.id);
  return successResponse(res, { data: { pdfUrl } });
});

module.exports = { create, getOne, getPdf };

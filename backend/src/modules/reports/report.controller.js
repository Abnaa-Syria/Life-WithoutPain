const ReportService = require('./report.service');
const { successResponse, createdResponse, paginatedResponse } = require('../../shared/responses');
const { asyncHandler } = require('../../utils/helpers');

class ReportController {
  static create = asyncHandler(async (req, res) => {
    const data = await ReportService.create(req.body);
    return createdResponse(res, { data });
  });

  static list = asyncHandler(async (req, res) => {
    const { data, total, page, limit } = await ReportService.list(req.query);
    return paginatedResponse(res, { data, total, page, limit });
  });

  static getById = asyncHandler(async (req, res) => {
    const data = await ReportService.getById(req.params.id);
    return successResponse(res, { data });
  });

  static update = asyncHandler(async (req, res) => {
    const data = await ReportService.update(req.params.id, req.body);
    return successResponse(res, { data });
  });

  static getPdf = asyncHandler(async (req, res) => {
    const pdfUrl = await ReportService.getPdf(req.params.id);
    return successResponse(res, { data: { pdfUrl } });
  });
}

module.exports = ReportController;

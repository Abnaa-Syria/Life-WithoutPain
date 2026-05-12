const PrescriptionService = require('./prescription.service');
const { successResponse, createdResponse, paginatedResponse } = require('../../shared/responses');
const { asyncHandler } = require('../../utils/helpers');

class PrescriptionController {
  static create = asyncHandler(async (req, res) => {
    const data = await PrescriptionService.create(req.body);
    return createdResponse(res, { data });
  });

  static list = asyncHandler(async (req, res) => {
    const { data, total, page, limit } = await PrescriptionService.list(req.query);
    return paginatedResponse(res, { data, total, page, limit });
  });

  static getById = asyncHandler(async (req, res) => {
    const data = await PrescriptionService.getById(req.params.id);
    return successResponse(res, { data });
  });

  static update = asyncHandler(async (req, res) => {
    const data = await PrescriptionService.update(req.params.id, req.body);
    return successResponse(res, { data });
  });

  static getPdf = asyncHandler(async (req, res) => {
    const pdfUrl = await PrescriptionService.getPdf(req.params.id);
    return successResponse(res, { data: { pdfUrl } });
  });

  static getQr = asyncHandler(async (req, res) => {
    const qrCodeValue = await PrescriptionService.getQr(req.params.id);
    return successResponse(res, { data: { qrCodeValue } });
  });
}

module.exports = PrescriptionController;

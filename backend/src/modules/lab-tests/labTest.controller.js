const LabTestService = require('./labTest.service');
const { successResponse, createdResponse, paginatedResponse } = require('../../shared/responses');
const { asyncHandler } = require('../../utils/helpers');

class LabTestController {
  static create = asyncHandler(async (req, res) => {
    const data = await LabTestService.create(req.body);
    return createdResponse(res, { data });
  });

  static list = asyncHandler(async (req, res) => {
    const { data, total, page, limit } = await LabTestService.list(req.query);
    return paginatedResponse(res, { data, total, page, limit });
  });

  static getById = asyncHandler(async (req, res) => {
    const data = await LabTestService.getById(req.params.id);
    return successResponse(res, { data });
  });

  static updateStatus = asyncHandler(async (req, res) => {
    const data = await LabTestService.updateStatus(req.params.id, req.body.status);
    return successResponse(res, { data });
  });

  static uploadResult = asyncHandler(async (req, res) => {
    const fileUrl = req.file ? `/uploads/${req.file.filename}` : req.body.fileUrl;
    const data = await LabTestService.uploadResult(req.params.id, req.user.id, fileUrl, req.body.notes);
    return createdResponse(res, { data });
  });

  static getResults = asyncHandler(async (req, res) => {
    const data = await LabTestService.getResults(req.params.id);
    return successResponse(res, { data });
  });
}

module.exports = LabTestController;

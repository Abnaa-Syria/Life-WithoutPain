const LabTestService = require('./labTest.service');
const { successResponse, createdResponse, paginatedResponse } = require('../../shared/responses');
const { asyncHandler } = require('../../utils/helpers');

const create = asyncHandler(async (req, res) => {
  const data = await LabTestService.createForDoctor(req.user.id, req.body);
  return createdResponse(res, { data });
});

const list = asyncHandler(async (req, res) => {
  const { data, total, page, limit } = await LabTestService.listForDoctor(req.user.id, req.query);
  return paginatedResponse(res, { data, total, page, limit });
});

const getById = asyncHandler(async (req, res) => {
  const data = await LabTestService.getByIdForDoctor(req.user.id, req.params.id);
  return successResponse(res, { data });
});

const updateStatus = asyncHandler(async (req, res) => {
  const data = await LabTestService.updateStatusForDoctor(req.user.id, req.params.id, req.body.status);
  return successResponse(res, { data });
});

const uploadResult = asyncHandler(async (req, res) => {
  const fileUrl = req.file ? `/uploads/${req.file.filename}` : req.body.fileUrl;
  const data = await LabTestService.uploadResultForDoctor(
    req.user.id,
    req.params.id,
    fileUrl,
    req.body.notes,
  );
  return createdResponse(res, { data });
});

const getResults = asyncHandler(async (req, res) => {
  const data = await LabTestService.getResultsForDoctor(req.user.id, req.params.id);
  return successResponse(res, { data });
});

module.exports = { create, list, getById, updateStatus, uploadResult, getResults };

const PrescriptionService = require('./prescription.service');
const { successResponse, createdResponse } = require('../../shared/responses');
const { asyncHandler } = require('../../utils/helpers');

const create = asyncHandler(async (req, res) => {
  const data = await PrescriptionService.createForDoctor(req.user.id, req.body);
  return createdResponse(res, { data, message: 'Prescription created' });
});

const getOne = asyncHandler(async (req, res) => {
  const data = await PrescriptionService.getByIdForDoctor(req.user.id, req.params.id);
  return successResponse(res, { data });
});

const getPdf = asyncHandler(async (req, res) => {
  const pdfUrl = await PrescriptionService.getPdfForDoctor(req.user.id, req.params.id);
  return successResponse(res, { data: { pdfUrl } });
});

module.exports = { create, getOne, getPdf };

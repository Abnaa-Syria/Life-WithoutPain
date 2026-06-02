const LabTestService = require('./labTest.service');
const { resolvePatientProfile, assertPatientOwnsLabTest } = require('../../shared/utils/patientAppContext');
const { successResponse, paginatedResponse } = require('../../shared/responses');
const { asyncHandler } = require('../../utils/helpers');

const list = asyncHandler(async (req, res) => {
  const { patientId } = await resolvePatientProfile(req.user.id);
  const { data, total, page, limit } = await LabTestService.list({ ...req.query, patientId });
  return paginatedResponse(res, { data, total, page, limit });
});

const getById = asyncHandler(async (req, res) => {
  const { patientId } = await resolvePatientProfile(req.user.id);
  await assertPatientOwnsLabTest(patientId, req.params.id);
  const data = await LabTestService.getById(req.params.id);
  return successResponse(res, { data });
});

const getResults = asyncHandler(async (req, res) => {
  const { patientId } = await resolvePatientProfile(req.user.id);
  await assertPatientOwnsLabTest(patientId, req.params.id);
  const data = await LabTestService.getResults(req.params.id);
  return successResponse(res, { data });
});

const getPdf = asyncHandler(async (req, res) => {
  const { patientId } = await resolvePatientProfile(req.user.id);
  await assertPatientOwnsLabTest(patientId, req.params.id);
  const pdfUrl = await LabTestService.getPdfForPatient(req.params.id);
  return successResponse(res, { data: { pdfUrl } });
});

module.exports = { list, getById, getResults, getPdf };

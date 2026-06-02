const PatientService = require('../patients/patient.service');
const PrescriptionService = require('../prescriptions/prescription.service');
const ReportService = require('../reports/report.service');
const { resolvePatientProfile, assertPatientOwnsPrescription, assertPatientOwnsReport, assertPatientOwnsMedicalFile } = require('../../shared/utils/patientAppContext');
const { successResponse, paginatedResponse } = require('../../shared/responses');
const { asyncHandler } = require('../../utils/helpers');
const {
  mapPrescriptionListItem,
  mapPrescriptionDetail,
  mapReportListItem,
  mapReportDetail,
  mapXrayListItem,
  mapXrayDetail,
} = require('../../shared/utils/patientAppMappers');

const listPrescriptions = asyncHandler(async (req, res) => {
  const result = await PatientService.listMyPrescriptions(req.user.id, req.query);
  return paginatedResponse(res, {
    data: result.data.map(mapPrescriptionListItem),
    total: result.total,
    page: result.page,
    limit: result.limit,
  });
});

const getPrescription = asyncHandler(async (req, res) => {
  const { patientId } = await resolvePatientProfile(req.user.id);
  await assertPatientOwnsPrescription(patientId, req.params.id);
  const data = await PrescriptionService.getById(req.params.id);
  return successResponse(res, { data: mapPrescriptionDetail(data) });
});

const getPrescriptionPdf = asyncHandler(async (req, res) => {
  const { patientId } = await resolvePatientProfile(req.user.id);
  await assertPatientOwnsPrescription(patientId, req.params.id);
  const pdfUrl = await PrescriptionService.getPdf(req.params.id);
  return successResponse(res, { data: { pdfUrl } });
});

const listReports = asyncHandler(async (req, res) => {
  const result = await PatientService.listMyReports(req.user.id, req.query);
  return paginatedResponse(res, {
    data: result.data.map(mapReportListItem),
    total: result.total,
    page: result.page,
    limit: result.limit,
  });
});

const getReport = asyncHandler(async (req, res) => {
  const { patientId } = await resolvePatientProfile(req.user.id);
  await assertPatientOwnsReport(patientId, req.params.id);
  const data = await ReportService.getById(req.params.id);
  return successResponse(res, { data: mapReportDetail(data) });
});

const getReportPdf = asyncHandler(async (req, res) => {
  const { patientId } = await resolvePatientProfile(req.user.id);
  await assertPatientOwnsReport(patientId, req.params.id);
  const pdfUrl = await ReportService.getPdf(req.params.id);
  return successResponse(res, { data: { pdfUrl } });
});

const listXrays = asyncHandler(async (req, res) => {
  const result = await PatientService.listMyRadiology(req.user.id, req.query);
  return paginatedResponse(res, {
    data: result.data.map(mapXrayListItem),
    total: result.total,
    page: result.page,
    limit: result.limit,
  });
});

const getXray = asyncHandler(async (req, res) => {
  const { patientId } = await resolvePatientProfile(req.user.id);
  const file = await assertPatientOwnsMedicalFile(patientId, req.params.id);
  return successResponse(res, { data: mapXrayDetail(file) });
});

const getXrayPdf = asyncHandler(async (req, res) => {
  const { patientId } = await resolvePatientProfile(req.user.id);
  const file = await assertPatientOwnsMedicalFile(patientId, req.params.id);
  return successResponse(res, { data: { pdfUrl: file.fileUrl } });
});

module.exports = {
  listPrescriptions,
  getPrescription,
  getPrescriptionPdf,
  listReports,
  getReport,
  getReportPdf,
  listXrays,
  getXray,
  getXrayPdf,
};

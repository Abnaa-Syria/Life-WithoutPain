const DoctorService = require('./doctor.service');
const { successResponse, createdResponse, paginatedResponse } = require('../../shared/responses');
const { asyncHandler } = require('../../utils/helpers');

const search = asyncHandler(async (req, res) => {
  const { data, total, page, limit } = await DoctorService.search(req.query);
  return paginatedResponse(res, { data, total, page, limit, message: 'Doctors fetched successfully' });
});

const getById = asyncHandler(async (req, res) => {
  const data = await DoctorService.getById(req.params.id);
  return successResponse(res, { data, message: 'Doctor details fetched' });
});

const getProfile = asyncHandler(async (req, res) => {
  const data = await DoctorService.getProfile(req.user.id);
  return successResponse(res, { data });
});

const updateProfile = asyncHandler(async (req, res) => {
  const data = await DoctorService.updateProfile(req.user.id, req.body);
  return successResponse(res, { data, message: 'Profile updated' });
});

const uploadVerificationDocument = asyncHandler(async (req, res) => {
  const fileData = {
    fileUrl: req.file ? `/uploads/${req.file.filename}` : req.body.fileUrl,
    fileType: req.body.fileType || 'document',
  };
  const data = await DoctorService.uploadVerificationDocument(req.user.id, fileData);
  return createdResponse(res, { data, message: 'Document uploaded' });
});

const getVerificationStatus = asyncHandler(async (req, res) => {
  const data = await DoctorService.getVerificationStatus(req.user.id);
  return successResponse(res, { data });
});

const getAvailability = asyncHandler(async (req, res) => {
  const data = await DoctorService.getAvailability(req.user.id);
  return successResponse(res, { data });
});

const createAvailability = asyncHandler(async (req, res) => {
  const data = await DoctorService.createAvailability(req.user.id, req.body);
  return createdResponse(res, { data });
});

const updateAvailability = asyncHandler(async (req, res) => {
  const data = await DoctorService.updateAvailability(req.user.id, parseInt(req.params.id), req.body);
  return successResponse(res, { data });
});

const deleteAvailability = asyncHandler(async (req, res) => {
  await DoctorService.deleteAvailability(req.user.id, parseInt(req.params.id));
  return successResponse(res, { data: null, message: 'Availability deleted' });
});

const getDashboardSummary = asyncHandler(async (req, res) => {
  const data = await DoctorService.getDashboardSummary(req.user.id);
  return successResponse(res, { data });
});

const getAppointments = asyncHandler(async (req, res) => {
  const { data, total, page, limit } = await DoctorService.getAppointments(req.user.id, req.query);
  return paginatedResponse(res, { data, total, page, limit });
});

const getPatients = asyncHandler(async (req, res) => {
  const data = await DoctorService.getPatients(req.user.id);
  return successResponse(res, { data });
});

const getPerformance = asyncHandler(async (req, res) => {
  const data = await DoctorService.getPerformance(req.user.id);
  return successResponse(res, { data });
});

const getFinancialSummary = asyncHandler(async (req, res) => {
  const data = await DoctorService.getFinancialSummary(req.user.id);
  return successResponse(res, { data });
});

module.exports = {
  search, getById, getProfile, updateProfile, uploadVerificationDocument, getVerificationStatus,
  getAvailability, createAvailability, updateAvailability, deleteAvailability,
  getDashboardSummary, getAppointments, getPatients, getPerformance, getFinancialSummary,
};

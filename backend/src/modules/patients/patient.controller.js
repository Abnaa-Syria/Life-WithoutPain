const PatientService = require('./patient.service');
const { successResponse, createdResponse, paginatedResponse } = require('../../shared/responses');
const { asyncHandler } = require('../../utils/helpers');

const getProfile = asyncHandler(async (req, res) => {
  const data = await PatientService.getProfile(req.user.id);
  return successResponse(res, { data, message: 'Profile fetched successfully' });
});

const updateProfile = asyncHandler(async (req, res) => {
  const data = await PatientService.updateProfile(req.user.id, req.body);
  return successResponse(res, { data, message: 'Profile updated successfully' });
});

const getMedicalProfile = asyncHandler(async (req, res) => {
  const data = await PatientService.getMedicalProfile(req.user.id);
  return successResponse(res, { data, message: 'Medical profile fetched successfully' });
});

const updateMedicalProfile = asyncHandler(async (req, res) => {
  const data = await PatientService.updateMedicalProfile(req.user.id, req.body);
  return successResponse(res, { data, message: 'Medical profile updated successfully' });
});

const getFamilyMembers = asyncHandler(async (req, res) => {
  const data = await PatientService.getFamilyMembers(req.user.id);
  return successResponse(res, { data, message: 'Family members fetched successfully' });
});

const createFamilyMember = asyncHandler(async (req, res) => {
  const data = await PatientService.createFamilyMember(req.user.id, req.body);
  return createdResponse(res, { data, message: 'Family member added successfully' });
});

const updateFamilyMember = asyncHandler(async (req, res) => {
  const data = await PatientService.updateFamilyMember(req.user.id, parseInt(req.params.id), req.body);
  return successResponse(res, { data, message: 'Family member updated successfully' });
});

const deleteFamilyMember = asyncHandler(async (req, res) => {
  await PatientService.deleteFamilyMember(req.user.id, parseInt(req.params.id));
  return successResponse(res, { data: null, message: 'Family member removed successfully' });
});

const getInsurances = asyncHandler(async (req, res) => {
  const data = await PatientService.getInsurances(req.user.id);
  return successResponse(res, { data, message: 'Insurances fetched successfully' });
});

const createInsurance = asyncHandler(async (req, res) => {
  const data = await PatientService.createInsurance(req.user.id, req.body);
  return createdResponse(res, { data, message: 'Insurance linked successfully' });
});

const updateInsurance = asyncHandler(async (req, res) => {
  const data = await PatientService.updateInsurance(req.user.id, parseInt(req.params.id), req.body);
  return successResponse(res, { data, message: 'Insurance updated successfully' });
});

const deleteInsurance = asyncHandler(async (req, res) => {
  await PatientService.deleteInsurance(req.user.id, parseInt(req.params.id));
  return successResponse(res, { data: null, message: 'Insurance removed successfully' });
});

const getMedicalFiles = asyncHandler(async (req, res) => {
  const { data, total, page, limit } = await PatientService.getMedicalFiles(req.user.id, req.query);
  return paginatedResponse(res, { data, total, page, limit, message: 'Medical files fetched successfully' });
});

const uploadMedicalFile = asyncHandler(async (req, res) => {
  const fileData = {
    fileUrl: req.file ? `/uploads/${req.file.filename}` : req.body.fileUrl,
    mimeType: req.file ? req.file.mimetype : req.body.mimeType || 'application/pdf',
    title: req.body.title,
    description: req.body.description,
    category: req.body.category || 'OTHER',
    appointmentId: req.body.appointmentId ? parseInt(req.body.appointmentId) : null,
  };
  const data = await PatientService.uploadMedicalFile(req.user.id, fileData);
  return createdResponse(res, { data, message: 'File uploaded successfully' });
});

const getDashboardSummary = asyncHandler(async (req, res) => {
  const data = await PatientService.getDashboardSummary(req.user.id);
  return successResponse(res, { data, message: 'Dashboard summary fetched successfully' });
});

const getUpcomingAppointments = asyncHandler(async (req, res) => {
  const { data, total, page, limit } = await PatientService.getUpcomingAppointments(req.user.id, req.query);
  return paginatedResponse(res, { data, total, page, limit });
});

const getAppointmentHistory = asyncHandler(async (req, res) => {
  const { data, total, page, limit } = await PatientService.getAppointmentHistory(req.user.id, req.query);
  return paginatedResponse(res, { data, total, page, limit });
});

const getNotifications = asyncHandler(async (req, res) => {
  const { data, total, page, limit } = await PatientService.getNotifications(req.user.id, req.query);
  return paginatedResponse(res, { data, total, page, limit });
});

const updateSettings = asyncHandler(async (req, res) => {
  const data = await PatientService.updateSettings(req.user.id, req.body);
  return successResponse(res, { data, message: 'Settings updated successfully' });
});

module.exports = {
  getProfile, updateProfile, getMedicalProfile, updateMedicalProfile,
  getFamilyMembers, createFamilyMember, updateFamilyMember, deleteFamilyMember,
  getInsurances, createInsurance, updateInsurance, deleteInsurance,
  getMedicalFiles, uploadMedicalFile, getDashboardSummary,
  getUpcomingAppointments, getAppointmentHistory, getNotifications, updateSettings,
};

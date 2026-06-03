const PatientService = require('./patient.service');
const { successResponse, createdResponse, paginatedResponse } = require('../../shared/responses');
const { asyncHandler } = require('../../utils/helpers');

const getProfile = asyncHandler(async (req, res) => {
  const data = await PatientService.getProfile(req.user.id);
  return successResponse(res, { data, messageKey: 'PROFILE_FETCHED' });
});

const updateProfile = asyncHandler(async (req, res) => {
  const data = await PatientService.updateProfile(req.user.id, req.body);
  return successResponse(res, { data, messageKey: 'PROFILE_UPDATED' });
});

const getMedicalProfile = asyncHandler(async (req, res) => {
  const data = await PatientService.getMedicalProfile(req.user.id);
  return successResponse(res, { data, messageKey: 'MEDICAL_PROFILE_FETCHED' });
});

const updateMedicalProfile = asyncHandler(async (req, res) => {
  const data = await PatientService.updateMedicalProfile(req.user.id, req.body);
  return successResponse(res, { data, messageKey: 'MEDICAL_PROFILE_UPDATED' });
});

const listMedicalProfileAttachments = asyncHandler(async (req, res) => {
  const data = await PatientService.listMedicalProfileAttachments(req.user.id);
  return successResponse(res, { data, messageKey: 'ATTACHMENTS_FETCHED' });
});

const addMedicalProfileAttachments = asyncHandler(async (req, res) => {
  const { getAttachmentTitlesFromBody } = require('../medical-profile/medical-profile.middleware');
  const data = await PatientService.addMedicalProfileAttachments(
    req.user.id,
    req.files,
    getAttachmentTitlesFromBody(req.body),
  );
  return createdResponse(res, { data, messageKey: 'ATTACHMENTS_UPLOADED' });
});

const deleteMedicalProfileAttachment = asyncHandler(async (req, res) => {
  const data = await PatientService.deleteMedicalProfileAttachment(req.user.id, req.params.id);
  return successResponse(res, { data, messageKey: 'ATTACHMENT_DELETED' });
});

const getFamilyMembers = asyncHandler(async (req, res) => {
  const data = await PatientService.getFamilyMembers(req.user.id);
  return successResponse(res, { data, messageKey: 'FAMILY_MEMBERS_FETCHED' });
});

const createFamilyMember = asyncHandler(async (req, res) => {
  const data = await PatientService.createFamilyMember(req.user.id, req.body);
  return createdResponse(res, { data, messageKey: 'FAMILY_MEMBER_ADDED' });
});

const updateFamilyMember = asyncHandler(async (req, res) => {
  const data = await PatientService.updateFamilyMember(req.user.id, parseInt(req.params.id), req.body);
  return successResponse(res, { data, messageKey: 'FAMILY_MEMBER_UPDATED' });
});

const deleteFamilyMember = asyncHandler(async (req, res) => {
  await PatientService.deleteFamilyMember(req.user.id, parseInt(req.params.id));
  return successResponse(res, { data: null, messageKey: 'FAMILY_MEMBER_REMOVED' });
});

const getInsurances = asyncHandler(async (req, res) => {
  const data = await PatientService.getInsurances(req.user.id);
  return successResponse(res, { data, messageKey: 'INSURANCES_FETCHED' });
});

const createInsurance = asyncHandler(async (req, res) => {
  const data = await PatientService.createInsurance(req.user.id, req.body);
  return createdResponse(res, { data, messageKey: 'INSURANCE_LINKED' });
});

const updateInsurance = asyncHandler(async (req, res) => {
  const data = await PatientService.updateInsurance(req.user.id, parseInt(req.params.id), req.body);
  return successResponse(res, { data, messageKey: 'INSURANCE_UPDATED' });
});

const deleteInsurance = asyncHandler(async (req, res) => {
  await PatientService.deleteInsurance(req.user.id, parseInt(req.params.id));
  return successResponse(res, { data: null, messageKey: 'INSURANCE_REMOVED' });
});

const getMedicalFiles = asyncHandler(async (req, res) => {
  const { data, total, page, limit } = await PatientService.getMedicalFiles(req.user.id, req.query);
  return paginatedResponse(res, { data, total, page, limit, messageKey: 'MEDICAL_FILES_FETCHED' });
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
  return createdResponse(res, { data, messageKey: 'FILE_UPLOADED' });
});

const getDashboardSummary = asyncHandler(async (req, res) => {
  const data = await PatientService.getDashboardSummary(req.user.id);
  return successResponse(res, { data, messageKey: 'DASHBOARD_FETCHED' });
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
  return successResponse(res, { data, messageKey: 'SETTINGS_UPDATED' });
});

module.exports = {
  getProfile, updateProfile, getMedicalProfile, updateMedicalProfile,
  listMedicalProfileAttachments, addMedicalProfileAttachments, deleteMedicalProfileAttachment,
  getFamilyMembers, createFamilyMember, updateFamilyMember, deleteFamilyMember,
  getInsurances, createInsurance, updateInsurance, deleteInsurance,
  getMedicalFiles, uploadMedicalFile, getDashboardSummary,
  getUpcomingAppointments, getAppointmentHistory, getNotifications, updateSettings,
};

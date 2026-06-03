const DoctorService = require('./doctor.service');
const { successResponse } = require('../../shared/responses');
const { asyncHandler } = require('../../utils/helpers');

const getProfile = asyncHandler(async (req, res) => {
  const profile = await DoctorService.getProfile(req.user.id);
  const data = {
    ...profile,
    language: profile.user?.preferredLanguage,
    name: profile.user?.fullName,
    phoneNumber: profile.user?.phone,
  };
  return successResponse(res, { data });
});

const updateProfile = asyncHandler(async (req, res) => {
  const data = await DoctorService.updateProfileForDoctor(req.user.id, req.body);
  return successResponse(res, { data, messageKey: 'PROFILE_UPDATED' });
});

const getClinicDetails = asyncHandler(async (req, res) => {
  const data = await DoctorService.getClinicDetails(req.user.id);
  return successResponse(res, { data });
});

const updateClinicDetails = asyncHandler(async (req, res) => {
  const data = await DoctorService.updateClinicDetails(req.user.id, req.body);
  return successResponse(res, { data, messageKey: 'CLINIC_DETAILS_UPDATED' });
});

const getSettings = asyncHandler(async (req, res) => {
  const data = await DoctorService.getSettings(req.user.id);
  return successResponse(res, { data });
});

const updateSettings = asyncHandler(async (req, res) => {
  const data = await DoctorService.updateSettings(req.user.id, req.body);
  return successResponse(res, { data, messageKey: 'SETTINGS_UPDATED' });
});

module.exports = {
  getProfile,
  updateProfile,
  getClinicDetails,
  updateClinicDetails,
  getSettings,
  updateSettings,
};

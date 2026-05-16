const DoctorService = require('./doctor.service');
const { successResponse } = require('../../shared/responses');
const { asyncHandler } = require('../../utils/helpers');

const getProfile = asyncHandler(async (req, res) => {
  const data = await DoctorService.getProfile(req.user.id);
  return successResponse(res, { data });
});

const updateProfile = asyncHandler(async (req, res) => {
  const data = await DoctorService.updateProfileForDoctor(req.user.id, req.body);
  return successResponse(res, { data, message: 'Profile updated' });
});

const getClinicDetails = asyncHandler(async (req, res) => {
  const data = await DoctorService.getClinicDetails(req.user.id);
  return successResponse(res, { data });
});

const updateClinicDetails = asyncHandler(async (req, res) => {
  const data = await DoctorService.updateClinicDetails(req.user.id, {
    address: req.body.address,
    city: req.body.city,
  });
  return successResponse(res, { data, message: 'Clinic details updated' });
});

const getSettings = asyncHandler(async (req, res) => {
  const data = await DoctorService.getSettings(req.user.id);
  return successResponse(res, { data });
});

const updateSettings = asyncHandler(async (req, res) => {
  const data = await DoctorService.updateSettings(req.user.id, req.body);
  return successResponse(res, { data, message: 'Settings updated' });
});

module.exports = {
  getProfile,
  updateProfile,
  getClinicDetails,
  updateClinicDetails,
  getSettings,
  updateSettings,
};

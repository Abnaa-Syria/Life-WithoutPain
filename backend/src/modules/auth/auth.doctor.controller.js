const AuthService = require('./auth.service');
const { successResponse, createdResponse } = require('../../shared/responses');
const { asyncHandler } = require('../../utils/helpers');

const register = asyncHandler(async (req, res) => {
  const licenseUrl = req.file ? `/uploads/${req.file.filename}` : null;
  const data = await AuthService.registerDoctorMobile({
    name: req.body.name,
    mobileNumber: req.body.mobileNumber,
    password: req.body.password,
    specializationId: req.body.specializationId,
    medicalLicenseNumber: req.body.medicalLicenseNumber,
    medicalLicenseExpiryDate: req.body.medicalLicenseExpiryDate,
    workPlace: req.body.workPlace,
    city: req.body.city,
    licenseUrl,
  });
  return createdResponse(res, { data, message: data.message });
});

const verifyOtp = asyncHandler(async (req, res) => {
  const data = await AuthService.verifyOtpByMobile(req.body);
  return successResponse(res, {
    data: { token: data.accessToken, doctor: data.user },
    message: 'OTP verified',
  });
});

const login = asyncHandler(async (req, res) => {
  const data = await AuthService.loginByMobile(req.body, req);
  return successResponse(res, { data, message: 'Login successful' });
});

const getMe = asyncHandler(async (req, res) => {
  const result = await AuthService.getProfile(req.user.id);
  return successResponse(res, { data: result, message: 'Profile fetched successfully' });
});

const deleteAccount = asyncHandler(async (req, res) => {
  const result = await AuthService.deleteAccount(req.user.id);
  return successResponse(res, { data: result, message: 'Account deleted successfully' });
});

module.exports = { register, verifyOtp, login, getMe, deleteAccount };

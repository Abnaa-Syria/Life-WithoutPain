const AuthService = require('./auth.service');
const { successResponse, createdResponse } = require('../../shared/responses');
const { asyncHandler } = require('../../utils/helpers');

const register = asyncHandler(async (req, res) => {
  const result = await AuthService.registerPatient(req.body);
  return createdResponse(res, { data: result, messageKey: 'PATIENT_REGISTERED' });
});

const login = asyncHandler(async (req, res) => {
  const data = await AuthService.loginPatientByMobile(req.body, req);
  return successResponse(res, { data, messageKey: 'LOGIN_SUCCESS' });
});

const verifyOtp = asyncHandler(async (req, res) => {
  const result = await AuthService.verifyOtpPatient(req.body);
  return successResponse(res, { data: result, messageKey: 'OTP_VERIFIED' });
});

const resendOtp = asyncHandler(async (req, res) => {
  const result = await AuthService.resendOtp(req.body);
  return successResponse(res, { data: result, messageKey: 'OTP_RESENT' });
});

const refreshToken = asyncHandler(async (req, res) => {
  const result = await AuthService.refreshToken(req.body);
  return successResponse(res, { data: result, messageKey: 'TOKEN_REFRESHED' });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const result = await AuthService.forgotPassword(req.body);
  return successResponse(res, { data: result, messageKey: 'PASSWORD_RESET_OTP_SENT' });
});

const resetPassword = asyncHandler(async (req, res) => {
  const result = await AuthService.resetPassword(req.body);
  return successResponse(res, { data: result, messageKey: 'PASSWORD_RESET_SUCCESS' });
});

const changePassword = asyncHandler(async (req, res) => {
  const result = await AuthService.changePassword(req.user.id, req.body);
  return successResponse(res, { data: result, messageKey: 'PASSWORD_CHANGED' });
});

const logout = asyncHandler(async (req, res) => {
  const result = await AuthService.logout(req.user.id, req.body.refreshToken);
  return successResponse(res, { data: result, messageKey: 'LOGOUT_SUCCESS' });
});

const getMe = asyncHandler(async (req, res) => {
  const result = await AuthService.getProfile(req.user.id);
  return successResponse(res, { data: result, messageKey: 'PROFILE_FETCHED' });
});

const deleteAccount = asyncHandler(async (req, res) => {
  const result = await AuthService.deleteAccount(req.user.id);
  return successResponse(res, { data: result, messageKey: 'ACCOUNT_DELETED' });
});

module.exports = {
  register,
  login,
  verifyOtp,
  resendOtp,
  refreshToken,
  forgotPassword,
  resetPassword,
  changePassword,
  logout,
  getMe,
  deleteAccount,
};

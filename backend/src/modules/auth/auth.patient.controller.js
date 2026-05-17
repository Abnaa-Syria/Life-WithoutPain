const AuthService = require('./auth.service');
const { successResponse, createdResponse } = require('../../shared/responses');
const { asyncHandler } = require('../../utils/helpers');

const register = asyncHandler(async (req, res) => {
  const result = await AuthService.registerPatient(req.body);
  return createdResponse(res, { data: result, message: 'Patient registered successfully. Please verify your phone with OTP.' });
});

const login = asyncHandler(async (req, res) => {
  const result = await AuthService.login(req.body, req);
  return successResponse(res, { data: result, message: 'Login successful' });
});

const loginMobile = asyncHandler(async (req, res) => {
  const result = await AuthService.loginMobile(req.body, req);
  return successResponse(res, { data: result, message: 'Login successful' });
});

const verifyOtp = asyncHandler(async (req, res) => {
  const result = await AuthService.verifyOtp(req.body);
  return successResponse(res, { data: result, message: 'OTP verified successfully' });
});

const resendOtp = asyncHandler(async (req, res) => {
  const result = await AuthService.resendOtp(req.body);
  return successResponse(res, { data: result, message: 'OTP resent successfully' });
});

const refreshToken = asyncHandler(async (req, res) => {
  const result = await AuthService.refreshToken(req.body);
  return successResponse(res, { data: result, message: 'Token refreshed successfully' });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const result = await AuthService.forgotPassword(req.body);
  return successResponse(res, { data: result, message: 'Password reset OTP sent' });
});

const resetPassword = asyncHandler(async (req, res) => {
  const result = await AuthService.resetPassword(req.body);
  return successResponse(res, { data: result, message: 'Password reset successful' });
});

const changePassword = asyncHandler(async (req, res) => {
  const result = await AuthService.changePassword(req.user.id, req.body);
  return successResponse(res, { data: result, message: 'Password changed successfully' });
});

const logout = asyncHandler(async (req, res) => {
  const result = await AuthService.logout(req.user.id, req.body.refreshToken);
  return successResponse(res, { data: result, message: 'Logged out successfully' });
});

const getMe = asyncHandler(async (req, res) => {
  const result = await AuthService.getProfile(req.user.id);
  return successResponse(res, { data: result, message: 'Profile fetched successfully' });
});

module.exports = {
  register,
  login,
  loginMobile,
  verifyOtp,
  resendOtp,
  refreshToken,
  forgotPassword,
  resetPassword,
  changePassword,
  logout,
  getMe,
};

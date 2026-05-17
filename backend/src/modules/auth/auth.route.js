const router = require('express').Router();
const controller = require('./auth.controller');
const { validate } = require('../../middlewares/validate');
const { authenticate } = require('../../middlewares/auth');
const { authLimiter, otpLimiter } = require('../../middlewares/rateLimiter');
const {
  registerPatientSchema,
  registerDoctorSchema,
  loginSchema,
  mobileLoginSchema,
  verifyOtpSchema,
  resendOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  refreshTokenSchema,
} = require('./auth.validator');

const { uploadSingle } = require('../../middlewares/upload');

router.post('/register/patient', authLimiter, validate(registerPatientSchema), controller.registerPatient);
router.post('/register/doctor', authLimiter, uploadSingle('licenseFile'), validate(registerDoctorSchema), controller.registerDoctor);
router.post('/login', authLimiter, validate(loginSchema), controller.login);
router.post('/login/mobile', authLimiter, validate(mobileLoginSchema), controller.loginMobile);
router.post('/verify-otp', otpLimiter, validate(verifyOtpSchema), controller.verifyOtp);
router.post('/resend-otp', otpLimiter, validate(resendOtpSchema), controller.resendOtp);
router.post('/refresh-token', validate(refreshTokenSchema), controller.refreshToken);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), controller.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), controller.resetPassword);
router.post('/change-password', authenticate, validate(changePasswordSchema), controller.changePassword);
router.post('/logout', authenticate, controller.logout);
router.get('/me', authenticate, controller.getMe);

module.exports = router;

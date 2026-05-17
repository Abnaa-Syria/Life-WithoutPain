const router = require('express').Router();
const controller = require('./auth.patient.controller');
const { authenticate, authorize } = require('../../middlewares/auth');
const { validate } = require('../../middlewares/validate');
const { authLimiter, otpLimiter } = require('../../middlewares/rateLimiter');
const { ROLES } = require('../../constants');
const {
  registerPatientSchema,
  loginSchema,
  mobileLoginSchema,
  verifyOtpSchema,
  resendOtpSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} = require('./auth.validator');

router.post('/register', authLimiter, validate(registerPatientSchema), controller.register);
router.post('/login', authLimiter, validate(loginSchema), controller.login);
router.post('/login/mobile', authLimiter, validate(mobileLoginSchema), controller.loginMobile);
router.post('/verify-otp', otpLimiter, validate(verifyOtpSchema), controller.verifyOtp);
router.post('/resend-otp', otpLimiter, validate(resendOtpSchema), controller.resendOtp);
router.post('/refresh-token', validate(refreshTokenSchema), controller.refreshToken);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), controller.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), controller.resetPassword);

router.use(authenticate, authorize(ROLES.PATIENT));
router.post('/logout', controller.logout);
router.get('/me', controller.getMe);
router.post('/change-password', validate(changePasswordSchema), controller.changePassword);

module.exports = router;

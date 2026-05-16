const router = require('express').Router();
const controller = require('./auth.doctor.controller');
const { validate } = require('../../middlewares/validate');
const { uploadSingle } = require('../../middlewares/upload');
const { authLimiter, otpLimiter } = require('../../middlewares/rateLimiter');
const {
  registerDoctorMobileSchema,
  loginDoctorMobileSchema,
  verifyOtpMobileSchema,
} = require('./auth.doctor.validator');

router.post('/register', authLimiter, uploadSingle('licenseAttachment'), validate(registerDoctorMobileSchema), controller.register);
router.post('/verify-otp', otpLimiter, validate(verifyOtpMobileSchema), controller.verifyOtp);
router.post('/login', authLimiter, validate(loginDoctorMobileSchema), controller.login);

module.exports = router;

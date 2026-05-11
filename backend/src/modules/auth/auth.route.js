const router = require('express').Router();
const controller = require('./auth.controller');
const { validate } = require('../../middlewares/validate');
const { authenticate } = require('../../middlewares/auth');
const { authLimiter, otpLimiter } = require('../../middlewares/rateLimiter');
const {
  registerPatientSchema,
  registerDoctorSchema,
  loginSchema,
  verifyOtpSchema,
  resendOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  refreshTokenSchema,
} = require('./auth.validator');

/**
 * @swagger
 * /auth/register/patient:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new patient
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fullName, email, phone, password]
 *             properties:
 *               fullName: { type: string, example: "أحمد محمد" }
 *               email: { type: string, example: "ahmed@example.com" }
 *               phone: { type: string, example: "+966500000000" }
 *               password: { type: string, example: "Password123" }
 *               preferredLanguage: { type: string, enum: [ar, en], default: ar }
 *     responses:
 *       201:
 *         description: Patient registered successfully
 *       409:
 *         description: User already exists
 */
router.post('/register/patient', authLimiter, validate(registerPatientSchema), controller.registerPatient);

/**
 * @swagger
 * /auth/register/doctor:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new doctor
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fullName, email, phone, password]
 *             properties:
 *               fullName: { type: string }
 *               email: { type: string }
 *               phone: { type: string }
 *               password: { type: string }
 *               specialityId: { type: integer }
 *               licenseNumber: { type: string }
 *     responses:
 *       201:
 *         description: Doctor registered successfully
 */
router.post('/register/doctor', authLimiter, validate(registerDoctorSchema), controller.registerDoctor);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login with email/phone and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [identifier, password]
 *             properties:
 *               identifier: { type: string, description: "Email or phone number" }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', authLimiter, validate(loginSchema), controller.login);

/**
 * @swagger
 * /auth/verify-otp:
 *   post:
 *     tags: [Auth]
 *     summary: Verify OTP code
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, code]
 *             properties:
 *               userId: { type: integer }
 *               code: { type: string }
 *               purpose: { type: string, enum: [verification, password_reset] }
 *     responses:
 *       200:
 *         description: OTP verified
 */
router.post('/verify-otp', otpLimiter, validate(verifyOtpSchema), controller.verifyOtp);

/**
 * @swagger
 * /auth/resend-otp:
 *   post:
 *     tags: [Auth]
 *     summary: Resend OTP code
 *     responses:
 *       200:
 *         description: OTP resent
 */
router.post('/resend-otp', otpLimiter, validate(resendOtpSchema), controller.resendOtp);

/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     tags: [Auth]
 *     summary: Refresh access token
 *     responses:
 *       200:
 *         description: Token refreshed
 */
router.post('/refresh-token', validate(refreshTokenSchema), controller.refreshToken);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     tags: [Auth]
 *     summary: Request password reset
 *     responses:
 *       200:
 *         description: Reset OTP sent
 */
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), controller.forgotPassword);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     tags: [Auth]
 *     summary: Reset password with OTP
 *     responses:
 *       200:
 *         description: Password reset successful
 */
router.post('/reset-password', validate(resetPasswordSchema), controller.resetPassword);

/**
 * @swagger
 * /auth/change-password:
 *   post:
 *     tags: [Auth]
 *     summary: Change password (authenticated)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Password changed
 */
router.post('/change-password', authenticate, validate(changePasswordSchema), controller.changePassword);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout and revoke refresh token
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out
 */
router.post('/logout', authenticate, controller.logout);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get current user profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 */
router.get('/me', authenticate, controller.getMe);

module.exports = router;

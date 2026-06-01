/**
 * @swagger
 * /doctor/auth/register:
 *   post:
 *     tags: [Doctor App - Auth]
 *     summary: Register doctor (mobile app)
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/DoctorAppRegisterRequest'
 *     responses:
 *       201:
 *         description: Signup submitted for approval
 *
 * /doctor/auth/verify-otp:
 *   post:
 *     tags: [Doctor App - Auth]
 *     summary: Verify OTP
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DoctorAppOtpRequest'
 *     responses:
 *       200:
 *         description: OTP verified
 *
 * /doctor/auth/login:
 *   post:
 *     tags: [Doctor App - Auth]
 *     summary: Doctor mobile login
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DoctorAppLoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 * /doctor/auth/register:
 *   post:
 *     tags: [Doctor App - Auth]
 *     summary: Register doctor (mobile app)
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/DoctorAppRegisterRequest'
 *     responses:
 *       201:
 *         description: Signup submitted for approval
 *
 * /doctor/auth/verify-otp:
 *   post:
 *     tags: [Doctor App - Auth]
 *     summary: Verify OTP
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DoctorAppOtpRequest'
 *     responses:
 *       200:
 *         description: OTP verified
 *
 * /doctor/auth/login:
 *   post:
 *     tags: [Doctor App - Auth]
 *     summary: Doctor mobile login
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DoctorAppLoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 data:
 *                   $ref: '#/components/schemas/DoctorLoginResponseDto'
 *       401:
 *         description: Invalid credentials, inactive account, or pending admin approval
 *
 * /doctor/auth/logout:
 *   post:
 *     tags: [Doctor App - Auth]
 *     summary: Doctor mobile logout
 *     description: Logout and revoke refresh token
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200:
 *         description: Logged out successfully
 *
 */

module.exports = {};

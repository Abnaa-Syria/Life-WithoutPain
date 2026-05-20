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
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 data:
 *                   $ref: '#/components/schemas/DoctorLoginResponseDto'
 *       401:
 *         description: Invalid credentials, inactive account, or pending admin approval
 *
 */

module.exports = {};

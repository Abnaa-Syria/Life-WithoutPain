/**
 * @swagger
 * /patient/auth/register:
 *   post:
 *     tags: [Patient App - Auth]
 *     summary: Register patient
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PatientAppRegisterRequest'
 *           example:
 *             fullName: 'أحمد محمد'
 *             identityNumber: '1234567890'
 *             dateOfBirth: '1990-05-15'
 *             email: patient@example.com
 *             phone: '+966500000001'
 *             password: 'Password123'
 *             preferredLanguage: ar
 *     responses:
 *       201:
 *         description: Registered — verify phone via OTP
 *
 * /patient/auth/login:
 *   post:
 *     tags: [Patient App - Auth]
 *     summary: Patient login with mobile number (PATIENT role only)
 *     description: Returns token, refreshToken, and patient profile. Doctor and staff accounts are rejected.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [phone, password]
 *             properties:
 *               phone: { type: string }
 *               password: { type: string, minLength: 6 }
 *           example:
 *             phone: '+966500000001'
 *             password: 'Password123'
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
 *                   $ref: '#/components/schemas/PatientLoginResponseDto'
 *       401:
 *         description: Invalid credentials or inactive account
 *       403:
 *         description: Account is not authorized for the patient app
 *
 * /patient/auth/verify-otp:
 *   post:
 *     tags: [Patient App - Auth]
 *     summary: Verify OTP
 *     description: Use stub code `12345` when OTP provider is mock (until SMS verification is implemented).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, code]
 *             properties:
 *               userId: { type: integer }
 *               code: { type: string, minLength: 5, maxLength: 5, description: Dev stub is 12345 }
 *               purpose: { type: string, enum: [verification, password_reset], default: verification }
 *           example:
 *             userId: 1
 *             code: '12345'
 *             purpose: verification
 *     responses:
 *       200:
 *         description: OTP verified
 *
 * /patient/auth/resend-otp:
 *   post:
 *     tags: [Patient App - Auth]
 *     summary: Resend OTP
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId]
 *             properties:
 *               userId: { type: integer }
 *               purpose: { type: string, enum: [verification, password_reset], default: verification }
 *           example:
 *             userId: 1
 *             purpose: verification
 *     responses:
 *       200:
 *         description: OTP resent
 *
 * /patient/auth/refresh-token:
 *   post:
 *     tags: [Patient App - Auth]
 *     summary: Refresh access token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken: { type: string }
 *           example:
 *             refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example'
 *     responses:
 *       200:
 *         description: Token refreshed
 *
 * /patient/auth/forgot-password:
 *   post:
 *     tags: [Patient App - Auth]
 *     summary: Request password reset OTP
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, format: email }
 *           example:
 *             email: patient@example.com
 *     responses:
 *       200:
 *         description: Reset OTP sent
 *
 * /patient/auth/reset-password:
 *   post:
 *     tags: [Patient App - Auth]
 *     summary: Reset password with OTP
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, code, newPassword]
 *             properties:
 *               userId: { type: integer }
 *               code: { type: string, minLength: 6, maxLength: 6 }
 *               newPassword: { type: string, format: password }
 *           example:
 *             userId: 1
 *             code: '654321'
 *             newPassword: 'NewPassword123'
 *     responses:
 *       200:
 *         description: Password reset successful
 *
 * /patient/auth/me:
 *   get:
 *     tags: [Patient App - Auth]
 *     summary: Get authenticated patient account
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Current user
 *
 * /patient/auth/logout:
 *   post:
 *     tags: [Patient App - Auth]
 *     summary: Patient logout
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

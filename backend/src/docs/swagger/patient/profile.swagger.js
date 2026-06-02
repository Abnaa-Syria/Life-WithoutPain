/**
 * @swagger
 * /patient/profile:
 *   get:
 *     tags: [Patient App - Profile]
 *     summary: Retrieve patient profile
 *     description: Returns name, identity number, phone, age, gender, and address.
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Patient profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 data:
 *                   $ref: '#/components/schemas/PatientProfileDto'
 *   put:
 *     tags: [Patient App - Profile]
 *     summary: Update patient profile (full replace)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName: { type: string }
 *               gender: { type: string, enum: [MALE, FEMALE] }
 *               dateOfBirth: { type: string, format: date }
 *               city: { type: string }
 *               address: { type: string }
 *               identityNumber: { type: string }
 *           example:
 *             fullName: 'أحمد محمد'
 *             gender: MALE
 *             dateOfBirth: '1990-05-15'
 *             city: 'Riyadh'
 *             address: '123 Main St'
 *     responses:
 *       200:
 *         description: Profile updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 data:
 *                   $ref: '#/components/schemas/PatientProfileDto'
 *   patch:
 *     tags: [Patient App - Profile]
 *     summary: Update patient profile (partial)
 *     description: Alias of PUT — accepts partial fields.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName: { type: string }
 *               gender: { type: string, enum: [MALE, FEMALE] }
 *               dateOfBirth: { type: string, format: date }
 *               city: { type: string }
 *               address: { type: string }
 *               identityNumber: { type: string }
 *     responses:
 *       200:
 *         description: Profile updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 data:
 *                   $ref: '#/components/schemas/PatientProfileDto'
 *
 */

module.exports = {};

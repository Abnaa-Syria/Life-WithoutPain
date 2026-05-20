/**
 * @swagger
 * /patient/profile:
 *   get:
 *     tags: [Patient App - Profile]
 *     summary: Personal details (name, identity, phone, age, gender)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Profile
 *   put:
 *     tags: [Patient App - Profile]
 *     summary: Update profile
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
 *         description: Updated
 *
 */

module.exports = {};

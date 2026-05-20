/**
 * @swagger
 * /patient/insurances:
 *   get:
 *     tags: [Patient App - Insurances]
 *     summary: List patient insurances
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Insurance list with company, label number, expiry, active status
 *   post:
 *     tags: [Patient App - Insurances]
 *     summary: Add insurance (multipart card image)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               cardImage: { type: string, format: binary }
 *               providerId: { type: integer }
 *               policyNumber: { type: string, description: Document / policy number }
 *               memberId: { type: string }
 *               expiryDate: { type: string, format: date }
 *           example:
 *             providerId: 1
 *             policyNumber: 'POL-2024-001'
 *             memberId: 'MEM-12345'
 *             expiryDate: '2026-12-31'
 *     responses:
 *       201:
 *         description: Insurance created
 *
 */

module.exports = {};

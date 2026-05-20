/**
 * @swagger
 * /doctor/profile:
 *   get:
 *     tags: [Doctor App - Profile]
 *     summary: Get personal details
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Profile
 *   patch:
 *     tags: [Doctor App - Profile]
 *     summary: Update personal details
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               identityNumber: { type: string }
 *               phoneNumber: { type: string }
 *     responses:
 *       200:
 *         description: Updated
 *
 */

module.exports = {};

/**
 * @swagger
 * /doctor/clinic-details:
 *   get:
 *     tags: [Doctor App - Clinic]
 *     summary: Get clinic details
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Clinic details
 *   patch:
 *     tags: [Doctor App - Clinic]
 *     summary: Update clinic details
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               address: { type: string }
 *               workingHours: { type: string }
 *     responses:
 *       200:
 *         description: Updated
 *
 */

module.exports = {};

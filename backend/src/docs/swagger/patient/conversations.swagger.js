/**
 * @swagger
 * /patient/conversations:
 *   get:
 *     tags: [Patient App - Conversations]
 *     summary: List chat conversations with doctors
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *         example: 20
 *     responses:
 *       200:
 *         description: Conversations
 *   post:
 *     tags: [Patient App - Conversations]
 *     summary: Start conversation with doctor
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [doctorId]
 *             properties:
 *               doctorId: { type: integer }
 *               appointmentId: { type: integer }
 *           example:
 *             doctorId: 1
 *             appointmentId: 1
 *     responses:
 *       201:
 *         description: Conversation created
 *
 */

module.exports = {};

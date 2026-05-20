/**
 * @swagger
 * /doctor/settings:
 *   get:
 *     tags: [Doctor App - Settings]
 *     summary: Get settings
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Settings
 *   patch:
 *     tags: [Doctor App - Settings]
 *     summary: Update settings
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               language: { type: string, enum: [ar, en] }
 *               notificationsEnabled: { type: boolean }
 *               privacy: { type: object }
 *     responses:
 *       200:
 *         description: Updated
 */

module.exports = {};

 */

module.exports = {};

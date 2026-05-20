/**
 * @swagger
 * /patient/settings:
 *   get:
 *     tags: [Patient App - Settings]
 *     summary: Settings (language, notifications, privacy)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Settings
 *   patch:
 *     tags: [Patient App - Settings]
 *     summary: Update settings
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               preferredLanguage: { type: string, enum: [ar, en] }
 *               notificationsEnabled: { type: boolean }
 *               darkModeEnabled: { type: boolean }
 *               privacy: { type: object }
 *           example:
 *             preferredLanguage: ar
 *             notificationsEnabled: true
 *             darkModeEnabled: false
 *     responses:
 *       200:
 *         description: Settings updated
 *
 */

module.exports = {};

/**
 * @swagger
 * /patient/files:
 *   get:
 *     tags: [Patient App - Files]
 *     summary: List medical file attachments
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Files list
 *   post:
 *     tags: [Patient App - Files]
 *     summary: Upload medical file attachment
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file: { type: string, format: binary }
 *               title: { type: string }
 *               category: { type: string }
 *           example:
 *             title: 'Lab results'
 *             category: 'LAB_RESULT'
 *     responses:
 *       201:
 *         description: File uploaded
 *
 */

module.exports = {};

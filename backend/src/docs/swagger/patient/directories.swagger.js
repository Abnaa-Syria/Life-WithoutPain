/**
 * @swagger
 * /patient/directories:
 *   get:
 *     tags: [Patient App - Directories]
 *     summary: Medical directories (reports, prescriptions, x-rays)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [all, reports, prescriptions, xrays] }
 *         example: all
 *     responses:
 *       200:
 *         description: Records with doctor details (not patient details)
 *
 */

module.exports = {};

/**
 * @swagger
 * /patient/services:
 *   get:
 *     tags: [Patient App - Services]
 *     summary: List services (HOME, REMOTE, CLINIC)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [HOME, REMOTE, CLINIC] }
 *         example: CLINIC
 *     responses:
 *       200:
 *         description: Service catalog
 *
 */

module.exports = {};

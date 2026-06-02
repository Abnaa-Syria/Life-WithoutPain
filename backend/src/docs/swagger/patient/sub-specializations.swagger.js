/**
 * @swagger
 * /patient/sub-specializations:
 *   get:
 *     tags: [Patient App - Sub-Specializations]
 *     summary: List sub-specializations by specialization id(s)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: specializationId
 *         schema: { type: integer }
 *       - in: query
 *         name: specializationIds
 *         schema: { type: string, example: '1,2,4' }
 *         description: Comma-separated specialization IDs
 *     responses:
 *       200:
 *         description: Flat list of sub-specializations
 */

module.exports = {};

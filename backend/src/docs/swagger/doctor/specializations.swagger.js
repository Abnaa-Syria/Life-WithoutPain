/**
 * @swagger
 * /doctor/specializations:
 *   get:
 *     tags: [Doctor App - Specializations]
 *     summary: List specializations with nested subSpecializations
 *     responses:
 *       200:
 *         description: List of specializations
 *
 * /doctor/sub-specializations:
 *   get:
 *     tags: [Doctor App - Specializations]
 *     summary: List sub-specializations by specialization id(s)
 *     parameters:
 *       - in: query
 *         name: specializationId
 *         schema: { type: integer }
 *       - in: query
 *         name: specializationIds
 *         schema: { type: string, example: '1,4' }
 *     responses:
 *       200:
 *         description: Flat sub-specialization list
 *
 */

module.exports = {};

/**
 * @swagger
 * /patient/doctors/search:
 *   get:
 *     tags: [Patient App - Doctors]
 *     summary: Search doctors
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         example: cardiology
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
 *         description: Doctor search results
 *
 * /patient/doctors/{id}:
 *   get:
 *     tags: [Patient App - Doctors]
 *     summary: Doctor public profile with certificates
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         example: 1
 *     responses:
 *       200:
 *         description: Doctor detail
 *
 */

module.exports = {};

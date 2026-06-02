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
 *
 * /patient/doctors/{id}/rate:
 *   post:
 *     tags: [Patient App - Doctors]
 *     summary: Rate a doctor
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 5
 *               review:
 *                 type: string
 *                 example: "Great doctor!"
 *     responses:
 *       200:
 *         description: Rating submitted successfully
 *
 */

module.exports = {};

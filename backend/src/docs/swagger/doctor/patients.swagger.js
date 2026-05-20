/**
 * @swagger
 * /doctor/patients:
 *   get:
 *     tags: [Doctor App - Patients]
 *     summary: List patients
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Patients list
 *
 * /doctor/patients/{id}:
 *   get:
 *     tags: [Doctor App - Patients]
 *     summary: Get patient details
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Patient details
 *
 */

module.exports = {};

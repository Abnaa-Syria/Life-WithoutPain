/**
 * @swagger
 * /patient/specializations:
 *   get:
 *     tags: [Patient App - Specializations]
 *     summary: List all specializations
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Specialization list
 *
 * /patient/specializations/{id}/doctors:
 *   get:
 *     tags: [Patient App - Specializations]
 *     summary: Doctors in specialization with available appointment count
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         example: 1
 *     responses:
 *       200:
 *         description: Doctors with availableAppointmentsCount
 *
 */

module.exports = {};

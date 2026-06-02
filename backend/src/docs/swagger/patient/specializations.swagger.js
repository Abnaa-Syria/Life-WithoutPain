/**
 * @swagger
 * /patient/specializations:
 *   get:
 *     tags: [Patient App - Specializations]
 *     summary: Retrieve specializations
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Paginated specializations with nested subSpecializations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SpecializationWithSubs'
 *                 meta:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *
 * /patient/specializations/{id}:
 *   get:
 *     tags: [Patient App - Specializations]
 *     summary: Get specialization with nested subSpecializations
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Specialization detail
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 data:
 *                   $ref: '#/components/schemas/SpecializationWithSubs'
 *
 * /patient/specializations/{id}/doctors:
 *   get:
 *     tags: [Patient App - Specializations]
 *     summary: Retrieve doctors by specialization
 *     description: Filter doctors using specializationId (path id).
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         example: 1
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Doctors with doctorName, specialization, subSpecializations, totalAppointmentsCount
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PatientDoctorListItem'
 *                 meta:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *
 */

module.exports = {};

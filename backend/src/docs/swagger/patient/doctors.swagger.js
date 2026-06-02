/**
 * @swagger
 * /patient/doctors/search:
 *   get:
 *     tags: [Patient App - Doctors]
 *     summary: Search doctors with pagination
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Search by doctor name
 *         example: Ahmed
 *       - in: query
 *         name: specialityId
 *         schema: { type: integer }
 *         description: Filter by specialization (Figma alias — specializationId)
 *       - in: query
 *         name: specializationId
 *         schema: { type: integer }
 *         description: Alias for specialityId
 *       - in: query
 *         name: subSpecializationId
 *         schema: { type: integer }
 *       - in: query
 *         name: subSpecializationIds
 *         schema: { type: string, example: '1,2' }
 *       - in: query
 *         name: city
 *         schema: { type: string }
 *       - in: query
 *         name: minFee
 *         schema: { type: number }
 *       - in: query
 *         name: maxFee
 *         schema: { type: number }
 *       - in: query
 *         name: minRating
 *         schema: { type: number }
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
 *         description: Each doctor includes doctorName, specialization, subSpecializations, totalAppointmentsCount
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
 * /patient/doctors/{id}/availability:
 *   get:
 *     tags: [Patient App - Doctors]
 *     summary: Doctor availability slots (required before booking)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: date
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Available slots and booked windows for selected date
 *
 * /patient/doctors/{id}:
 *   get:
 *     tags: [Patient App - Doctors]
 *     summary: Doctor details
 *     description: |
 *       Returns name, specialization, subSpecializations, yearsOfExperience, address, reviews,
 *       certificates (names only), and consultationPrice. Certificate file URLs are admin-only.
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 data:
 *                   $ref: '#/components/schemas/PatientDoctorDetail'
 *
 */

module.exports = {};

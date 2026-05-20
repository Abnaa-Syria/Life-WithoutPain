/**
 * @swagger
 * /doctor/reports:
 *   post:
 *     tags: [Doctor App - Reports]
 *     summary: Create medical report
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               patientId: { type: integer }
 *               appointmentId: { type: integer }
 *               visitReason: { type: string }
 *               symptoms: { type: string }
 *               clinicalExamination: { type: string }
 *               tests:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     testType: { type: string }
 *                     value: { type: string }
 *               nextAppointmentDate: { type: string, format: date-time }
 *     responses:
 *       201:
 *         description: Report created
 *
 * /doctor/reports/{id}:
 *   get:
 *     tags: [Doctor App - Reports]
 *     summary: Get report details
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Report details
 *
 * /doctor/reports/{id}/pdf:
 *   get:
 *     tags: [Doctor App - Reports]
 *     summary: Download report PDF
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: PDF URL
 *
 */

module.exports = {};

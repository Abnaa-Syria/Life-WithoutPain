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
 *               prescriptionId: { type: integer, nullable: true }
 *               visitReason: { type: string }
 *               summary: { type: string }
 *               clinicalExamination:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     item: { type: string }
 *                     value: { type: string }
 *               resultSummary: { type: string }
 *               resultsList:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     testName: { type: string }
 *                     result: { type: string }
 *               nextAppointmentDate: { type: string, format: date-time }
 *               attachments:
 *                 type: array
 *                 items: { type: string }
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

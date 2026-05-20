/**
 * @swagger
 * /doctor/prescriptions:
 *   post:
 *     tags: [Doctor App - Prescriptions]
 *     summary: Create prescription
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               patientId: { type: integer }
 *               appointmentId: { type: integer }
 *               diagnosis: { type: string }
 *               medications:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     medicineName: { type: string }
 *                     dosage: { type: string }
 *                     frequency: { type: string }
 *                     timing: { type: string }
 *                     duration: { type: string }
 *               sideEffectsNotes: { type: string }
 *     responses:
 *       201:
 *         description: Prescription created
 *
 * /doctor/prescriptions/{id}:
 *   get:
 *     tags: [Doctor App - Prescriptions]
 *     summary: Get prescription details
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Prescription details
 *
 * /doctor/prescriptions/{id}/pdf:
 *   get:
 *     tags: [Doctor App - Prescriptions]
 *     summary: Download prescription PDF
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

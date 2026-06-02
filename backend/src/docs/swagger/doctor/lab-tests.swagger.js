/**
 * @swagger
 * /doctor/lab-tests:
 *   post:
 *     tags: [Doctor App - Lab Tests]
 *     summary: Create a new lab test request
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [appointmentId, patientId, title]
 *             properties:
 *               appointmentId: { type: integer }
 *               patientId: { type: integer }
 *               title: { type: string }
 *               notes: { type: string }
 *     responses:
 *       201:
 *         description: Lab test created
 *   get:
 *     tags: [Doctor App - Lab Tests]
 *     summary: List requested lab tests
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: patientId
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Lab tests list
 *
 * /doctor/lab-tests/{id}:
 *   get:
 *     tags: [Doctor App - Lab Tests]
 *     summary: Get lab test details
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Lab test details
 *
 * /doctor/lab-tests/{id}/status:
 *   patch:
 *     tags: [Doctor App - Lab Tests]
 *     summary: Update lab test status
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status: { type: string, enum: [REQUESTED, SAMPLE_COLLECTED, IN_PROGRESS, COMPLETED, CANCELLED] }
 *     responses:
 *       200:
 *         description: Status updated
 *
 * /doctor/lab-tests/{id}/results:
 *   post:
 *     tags: [Doctor App - Lab Tests]
 *     summary: Upload a lab test result
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file: { type: string, format: binary }
 *               notes: { type: string }
 *     responses:
 *       201:
 *         description: Result uploaded
 *   get:
 *     tags: [Doctor App - Lab Tests]
 *     summary: Get lab test results
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Lab test results history
 */

module.exports = {};

/**
 * @swagger
 * /patient/lab-tests:
 *   get:
 *     tags: [Patient App - Lab Tests]
 *     summary: List patient lab tests
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: appointmentId
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Patient lab tests list
 *
 * /patient/lab-tests/{id}:
 *   get:
 *     tags: [Patient App - Lab Tests]
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
 * /patient/lab-tests/{id}/results:
 *   get:
 *     tags: [Patient App - Lab Tests]
 *     summary: Get lab test results history
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Lab test results
 */

module.exports = {};

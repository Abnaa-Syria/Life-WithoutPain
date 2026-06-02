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
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: doctorName, specialization, summary
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
 *                     $ref: '#/components/schemas/PatientLabTestListItem'
 *                 meta:
 *                   $ref: '#/components/schemas/PaginationMeta'
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
 * /patient/lab-tests/{id}/pdf:
 *   get:
 *     tags: [Patient App - Lab Tests]
 *     summary: Download lab test result PDF URL
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Returns { pdfUrl }
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

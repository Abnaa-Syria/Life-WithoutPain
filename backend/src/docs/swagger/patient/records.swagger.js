/**
 * @swagger
 * /patient/prescriptions:
 *   get:
 *     tags: [Patient App - Records]
 *     summary: List prescriptions
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: doctorName, specialization, summary, appointmentDateTime
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
 *                     $ref: '#/components/schemas/PatientPrescriptionListItem'
 *                 meta:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *
 * /patient/prescriptions/{id}:
 *   get:
 *     tags: [Patient App - Records]
 *     summary: Prescription details
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Full prescription with medicines array
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 data:
 *                   $ref: '#/components/schemas/PatientPrescriptionDetail'
 *
 * /patient/prescriptions/{id}/pdf:
 *   get:
 *     tags: [Patient App - Records]
 *     summary: Download prescription PDF URL
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
 * /patient/reports:
 *   get:
 *     tags: [Patient App - Records]
 *     summary: List medical reports
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: doctorName, specialization, summary, appointmentDateTime
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
 *                     $ref: '#/components/schemas/PatientReportListItem'
 *                 meta:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *
 * /patient/reports/{id}:
 *   get:
 *     tags: [Patient App - Records]
 *     summary: Report details
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Full report with clinicalTests, results, attachments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 data:
 *                   $ref: '#/components/schemas/PatientReportDetail'
 *
 * /patient/reports/{id}/pdf:
 *   get:
 *     tags: [Patient App - Records]
 *     summary: Download report PDF URL
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
 * /patient/x-rays:
 *   get:
 *     tags: [Patient App - Records]
 *     summary: List x-ray / radiology files
 *     security: [{ bearerAuth: [] }]
 *     parameters:
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
 *                     $ref: '#/components/schemas/PatientXrayListItem'
 *                 meta:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *
 * /patient/x-rays/{id}:
 *   get:
 *     tags: [Patient App - Records]
 *     summary: X-ray details
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: X-ray detail with uploadedFile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 data:
 *                   $ref: '#/components/schemas/PatientXrayDetail'
 *
 * /patient/x-rays/{id}/pdf:
 *   get:
 *     tags: [Patient App - Records]
 *     summary: Download x-ray file URL
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Returns { pdfUrl }
 */

module.exports = {};

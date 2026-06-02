/**
 * @swagger
 * /patient/insurances/providers:
 *   get:
 *     tags: [Patient App - Insurances]
 *     summary: List insurance providers (admin-managed catalog for selection)
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
 *         description: Paginated providers
 *
 * /patient/insurances:
 *   get:
 *     tags: [Patient App - Insurances]
 *     summary: Get patient insurance details
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Insurance list
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
 *                     $ref: '#/components/schemas/PatientInsuranceDto'
 *   post:
 *     tags: [Patient App - Insurances]
 *     summary: Add insurance data
 *     description: |
 *       Figma field aliases: insuranceProviderId → providerId, insuranceCardImage → cardImage,
 *       insuranceCreditNumber → policyNumber, insuranceExpiryDate → expiryDate.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [providerId, policyNumber, expiryDate]
 *             properties:
 *               cardImage: { type: string, format: binary, description: Figma — insuranceCardImage }
 *               providerId: { type: integer, description: Figma — insuranceProviderId }
 *               policyNumber: { type: string, description: Figma — insuranceCreditNumber }
 *               memberId: { type: string }
 *               expiryDate: { type: string, format: date, description: Figma — insuranceExpiryDate }
 *               isPrimary: { type: boolean }
 *           example:
 *             providerId: 1
 *             policyNumber: 'POL-2024-001'
 *             memberId: 'MEM-12345'
 *             expiryDate: '2026-12-31'
 *     responses:
 *       201:
 *         description: Insurance created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 data:
 *                   $ref: '#/components/schemas/PatientInsuranceDto'
 *
 * /patient/insurances/{id}:
 *   put:
 *     tags: [Patient App - Insurances]
 *     summary: Update insurance details
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
 *               cardImage: { type: string, format: binary }
 *               providerId: { type: integer }
 *               policyNumber: { type: string }
 *               memberId: { type: string }
 *               expiryDate: { type: string, format: date }
 *               isPrimary: { type: boolean }
 *     responses:
 *       200:
 *         description: Updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 data:
 *                   $ref: '#/components/schemas/PatientInsuranceDto'
 *   patch:
 *     tags: [Patient App - Insurances]
 *     summary: Update insurance details (partial)
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
 *               cardImage: { type: string, format: binary }
 *               providerId: { type: integer }
 *               policyNumber: { type: string }
 *               memberId: { type: string }
 *               expiryDate: { type: string, format: date }
 *               isPrimary: { type: boolean }
 *     responses:
 *       200:
 *         description: Updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 data:
 *                   $ref: '#/components/schemas/PatientInsuranceDto'
 *   delete:
 *     tags: [Patient App - Insurances]
 *     summary: Delete insurance policy
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Deleted
 *
 */

module.exports = {};

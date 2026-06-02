/**
 * @swagger
 * /patient/medical-profile:
 *   get:
 *     tags: [Patient App - Medical Profile]
 *     summary: Get medical profile (catalog IDs and resolved items)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Medical profile (includes reportAttachments)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 data:
 *                   $ref: '#/components/schemas/MedicalProfile'
 *   put:
 *     tags: [Patient App - Medical Profile]
 *     summary: Complete / update medical profile (structured data)
 *     description: |
 *       JSON only. Figma aliases: chronicDiseases → chronicDiseaseIds, mainMedications → medicationIds.
 *       Upload medical reports via POST /patient/medical-profile/attachments (Figma — medicalReports).
 *       Manage items individually via chronic-diseases/{id} and medications/{id} sub-routes.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               chronicDiseaseIds: { type: array, items: { type: integer } }
 *               medicationIds: { type: array, items: { type: integer } }
 *               allergyIds: { type: array, items: { type: integer } }
 *               surgeries: { type: string }
 *               familyHistory: { type: string }
 *               notes: { type: string }
 *           example:
 *             chronicDiseaseIds: [1]
 *             medicationIds: [1]
 *             allergyIds: [1]
 *             notes: 'No recent surgeries'
 *     responses:
 *       200:
 *         description: Updated (includes reportAttachments)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 data:
 *                   $ref: '#/components/schemas/MedicalProfile'
 *
 * /patient/medical-profile/chronic-diseases/{id}:
 *   post:
 *     tags: [Patient App - Medical Profile]
 *     summary: Add chronic disease by catalog id
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Updated profile
 *   delete:
 *     tags: [Patient App - Medical Profile]
 *     summary: Remove chronic disease
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Updated profile
 *
 * /patient/medical-profile/medications/{id}:
 *   post:
 *     tags: [Patient App - Medical Profile]
 *     summary: Add medication by catalog id
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Updated profile
 *   delete:
 *     tags: [Patient App - Medical Profile]
 *     summary: Remove medication
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Updated profile
 *
 * /patient/medical-profile/attachments:
 *   get:
 *     tags: [Patient App - Medical Profile]
 *     summary: List medical profile report attachments
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Attachment list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MedicalProfileAttachment'
 *   post:
 *     tags: [Patient App - Medical Profile]
 *     summary: Upload medical report attachments (one or more)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/MedicalProfileAttachmentUpload'
 *           encoding:
 *             file:
 *               contentType: image/jpeg, image/png, image/gif, image/webp, application/pdf
 *             files:
 *               contentType: image/jpeg, image/png, image/gif, image/webp, application/pdf
 *     responses:
 *       201:
 *         description: Attachments uploaded
 *
 * /patient/medical-profile/attachments/{id}:
 *   delete:
 *     tags: [Patient App - Medical Profile]
 *     summary: Delete a medical profile report attachment
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Attachment deleted
 *
 */

module.exports = {};

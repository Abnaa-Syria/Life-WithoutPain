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
 *                 data:
 *                   $ref: '#/components/schemas/MedicalProfile'
 *   put:
 *     tags: [Patient App - Medical Profile]
 *     summary: Update medical profile (structured data only)
 *     description: |
 *       JSON only. Updates chronic diseases, medications, allergies, and text fields.
 *       Upload or delete report attachments via `/medical-profile/attachments` sub-routes.
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
 *                 data:
 *                   $ref: '#/components/schemas/MedicalProfile'
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

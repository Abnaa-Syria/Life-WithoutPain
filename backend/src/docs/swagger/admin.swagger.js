/**
 * @swagger
 * /admin/chronic-diseases:
 *   get:
 *     tags: [Admin]
 *     summary: List chronic diseases catalog
 *     security: [{ bearerAuth: [] }]
 *   post:
 *     tags: [Admin]
 *     summary: Create chronic disease
 *     security: [{ bearerAuth: [] }]
 *
 * /admin/chronic-diseases/{id}:
 *   get:
 *     tags: [Admin]
 *     summary: Get chronic disease by ID
 *     security: [{ bearerAuth: [] }]
 *   put:
 *     tags: [Admin]
 *     summary: Update chronic disease
 *     security: [{ bearerAuth: [] }]
 *   delete:
 *     tags: [Admin]
 *     summary: Delete chronic disease
 *     security: [{ bearerAuth: [] }]
 *
 * /admin/allergies:
 *   get:
 *     tags: [Admin]
 *     summary: List allergies catalog
 *     security: [{ bearerAuth: [] }]
 *   post:
 *     tags: [Admin]
 *     summary: Create allergy
 *     security: [{ bearerAuth: [] }]
 *
 * /admin/allergies/{id}:
 *   get:
 *     tags: [Admin]
 *     summary: Get allergy by ID
 *     security: [{ bearerAuth: [] }]
 *   put:
 *     tags: [Admin]
 *     summary: Update allergy
 *     security: [{ bearerAuth: [] }]
 *   delete:
 *     tags: [Admin]
 *     summary: Delete allergy
 *     security: [{ bearerAuth: [] }]
 *
 * /admin/patients/{id}/medical-profile:
 *   put:
 *     tags: [Admin]
 *     summary: Update patient medical profile (catalog IDs)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
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
 *     responses:
 *       200:
 *         description: Medical profile updated (includes reportAttachments)
 *
 * /admin/patients/{patientId}/medical-profile/attachments:
 *   get:
 *     tags: [Admin]
 *     summary: List medical profile report attachments for a patient
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Attachment list
 *   post:
 *     tags: [Admin]
 *     summary: Upload medical profile report attachments for a patient
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema: { type: integer }
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
 * /admin/patients/{patientId}/medical-profile/attachments/{id}:
 *   delete:
 *     tags: [Admin]
 *     summary: Delete a patient medical profile attachment
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema: { type: integer }
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Attachment deleted
 */

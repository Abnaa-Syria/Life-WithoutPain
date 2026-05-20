/**
 * @swagger
 * /patients/me/profile:
 *   get:
 *     tags: [Patients]
 *     summary: Get patient profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Patient profile
 *   put:
 *     tags: [Patients]
 *     summary: Update patient profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile updated
 *
 * /patients/me/medical-profile:
 *   get:
 *     tags: [Patients]
 *     summary: Get patient medical profile (includes reportAttachments)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Medical profile
 *   put:
 *     tags: [Patients]
 *     summary: Update medical profile (JSON only, structured fields)
 *     description: Legacy mirror of Patient App profile update. Use attachment sub-routes for files.
 *     security:
 *       - bearerAuth: []
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
 *         description: Updated
 *
 * /patients/me/medical-profile/attachments:
 *   get:
 *     tags: [Patients]
 *     summary: List medical profile report attachments (legacy)
 *     security:
 *       - bearerAuth: []
 *   post:
 *     tags: [Patients]
 *     summary: Upload medical profile report attachments (legacy)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/MedicalProfileAttachmentUpload'
 *
 * /patients/me/medical-profile/attachments/{id}:
 *   delete:
 *     tags: [Patients]
 *     summary: Delete medical profile report attachment (legacy)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *
 * /patients/me/family-members:
 *   get:
 *     tags: [Patients]
 *     summary: Get family members
 *     security:
 *       - bearerAuth: []
 *   post:
 *     tags: [Patients]
 *     summary: Add family member
 *     security:
 *       - bearerAuth: []
 *
 * /patients/me/insurances:
 *   get:
 *     tags: [Patients]
 *     summary: Get patient insurance records
 *     security:
 *       - bearerAuth: []
 *   post:
 *     tags: [Patients]
 *     summary: Add insurance record
 *     security:
 *       - bearerAuth: []
 *
 * /patients/me/dashboard-summary:
 *   get:
 *     tags: [Patients]
 *     summary: Get patient dashboard summary
 *     security:
 *       - bearerAuth: []
 */

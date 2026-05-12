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
 *     summary: Get patient medical profile
 *     security:
 *       - bearerAuth: []
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

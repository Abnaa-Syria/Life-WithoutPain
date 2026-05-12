/**
 * @swagger
 * /call-sessions:
 *   post:
 *     tags: [Call Sessions]
 *     summary: Create a call session (Doctor only)
 *     security:
 *       - bearerAuth: []
 *
 * /call-sessions/{id}:
 *   get:
 *     tags: [Call Sessions]
 *     summary: Get call session details
 *     security:
 *       - bearerAuth: []
 *
 * /call-sessions/{id}/start:
 *   patch:
 *     tags: [Call Sessions]
 *     summary: Start a call session
 *     security:
 *       - bearerAuth: []
 *
 * /call-sessions/{id}/end:
 *   patch:
 *     tags: [Call Sessions]
 *     summary: End a call session
 *     security:
 *       - bearerAuth: []
 *
 * /reviews:
 *   post:
 *     tags: [Reviews]
 *     summary: Submit a doctor review (Patient only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [appointmentId, doctorId, rating]
 *             properties:
 *               appointmentId: { type: integer }
 *               doctorId: { type: integer }
 *               rating: { type: number, minimum: 1, maximum: 5 }
 *               comment: { type: string }
 *
 * /reviews/doctor/{doctorId}:
 *   get:
 *     tags: [Reviews]
 *     summary: Get reviews for a specific doctor
 *
 * /settings:
 *   get:
 *     tags: [Settings]
 *     summary: Get system settings (public filtered by default)
 *   post:
 *     tags: [Settings]
 *     summary: Create a system setting (Super Admin only)
 *     security:
 *       - bearerAuth: []
 *
 * /audit-logs:
 *   get:
 *     tags: [Audit Logs]
 *     summary: List audit logs (Super Admin only)
 *     security:
 *       - bearerAuth: []
 */

/**
 * @swagger
 * /doctor/appointments:
 *   get:
 *     tags: [Doctor App - Appointments]
 *     summary: List appointments
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *       - in: query
 *         name: type
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Appointments list
 *
 * /doctor/appointments/{id}:
 *   get:
 *     tags: [Doctor App - Appointments]
 *     summary: Get appointment details
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Appointment details
 *
 * /doctor/appointments/{id}/confirm:
 *   patch:
 *     tags: [Doctor App - Appointments]
 *     summary: Confirm appointment
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Confirmed
 *
 * /doctor/appointments/{id}/reject:
 *   patch:
 *     tags: [Doctor App - Appointments]
 *     summary: Reject appointment
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Rejected
 *
 * /doctor/appointments/{id}/cancel:
 *   patch:
 *     tags: [Doctor App - Appointments]
 *     summary: Cancel appointment
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Cancelled
 *
 * /doctor/appointments/{id}/start-session:
 *   post:
 *     tags: [Doctor App - Appointments]
 *     summary: Start appointment video session
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Session started
 *
 * /doctor/appointments/{id}/chat:
 *   get:
 *     tags: [Doctor App - Appointments]
 *     summary: Get appointment chat messages
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Chat messages
 *   post:
 *     tags: [Doctor App - Appointments]
 *     summary: Send chat message
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message: { type: string }
 *     responses:
 *       201:
 *         description: Message sent
 *
 */

module.exports = {};

/**
 * @swagger
 * /appointments:
 *   post:
 *     tags: [Appointments]
 *     summary: Create a new appointment
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Appointment created
 *   get:
 *     tags: [Appointments]
 *     summary: List appointments
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Appointment list
 *
 * /appointments/{id}:
 *   get:
 *     tags: [Appointments]
 *     summary: Get appointment by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Appointment details
 *
 * /appointments/{id}/confirm:
 *   patch:
 *     tags: [Appointments]
 *     summary: Confirm appointment
 *     security:
 *       - bearerAuth: []
 *
 * /appointments/{id}/cancel:
 *   patch:
 *     tags: [Appointments]
 *     summary: Cancel appointment
 *     security:
 *       - bearerAuth: []
 *
 * /appointments/{id}/reschedule:
 *   patch:
 *     tags: [Appointments]
 *     summary: Reschedule appointment
 *     security:
 *       - bearerAuth: []
 *
 * /appointments/{id}/start:
 *   patch:
 *     tags: [Appointments]
 *     summary: Start appointment (Doctor only)
 *     security:
 *       - bearerAuth: []
 *
 * /appointments/{id}/complete:
 *   patch:
 *     tags: [Appointments]
 *     summary: Complete appointment (Doctor only)
 *     security:
 *       - bearerAuth: []
 */

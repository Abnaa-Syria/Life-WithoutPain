/**
 * @swagger
 * /patient/appointments:
 *   get:
 *     tags: [Patient App - Appointments]
 *     summary: List appointments (ordered by date)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: filter
 *         schema:
 *           $ref: '#/components/schemas/PatientAppointmentFilter'
 *         example: all
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *         example: 20
 *     responses:
 *       200:
 *         description: Each item includes doctor name, specializations, datetime, fees, status, isComing
 *   post:
 *     tags: [Patient App - Appointments]
 *     summary: Book appointment
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [doctorId, appointmentDate, startTime, endTime]
 *             properties:
 *               doctorId: { type: integer }
 *               serviceId: { type: integer }
 *               appointmentDate: { type: string, format: date }
 *               startTime: { type: string, example: '09:00' }
 *               endTime: { type: string, example: '09:30' }
 *               bookingFor: { type: string, enum: [personal, family] }
 *               familyMemberId: { type: integer }
 *               paymentMode: { type: string, enum: [DIRECT, INSURANCE] }
 *           example:
 *             doctorId: 1
 *             serviceId: 1
 *             appointmentDate: '2026-06-01'
 *             startTime: '09:00'
 *             endTime: '09:30'
 *             bookingFor: personal
 *             paymentMode: DIRECT
 *     responses:
 *       201:
 *         description: Appointment booked
 *
 * /patient/appointments/{id}:
 *   get:
 *     tags: [Patient App - Appointments]
 *     summary: Appointment detail with doctor preview
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         example: 1
 *     responses:
 *       200:
 *         description: Doctor experience, rating, address, certificates
 *
 * /patient/appointments/{id}/session:
 *   get:
 *     tags: [Patient App - Appointments]
 *     summary: Get or join video consultation session
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         example: 1
 *     responses:
 *       200:
 *         description: Session join URL for patient
 *
 * /patient/appointments/{id}/cancel:
 *   patch:
 *     tags: [Patient App - Appointments]
 *     summary: Cancel appointment
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         example: 1
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason: { type: string }
 *           example:
 *             reason: 'Schedule conflict'
 *     responses:
 *       200:
 *         description: Cancelled
 *
 * /patient/appointments/{id}/reschedule:
 *   patch:
 *     tags: [Patient App - Appointments]
 *     summary: Reschedule appointment
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [appointmentDate, startTime, endTime]
 *             properties:
 *               appointmentDate: { type: string, format: date }
 *               startTime: { type: string }
 *               endTime: { type: string }
 *               reason: { type: string }
 *           example:
 *             appointmentDate: '2026-06-05'
 *             startTime: '10:00'
 *             endTime: '10:30'
 *             reason: 'Prefer morning slot'
 *     responses:
 *       200:
 *         description: Rescheduled
 *
 */

module.exports = {};

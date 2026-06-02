/**
 * @swagger
 * /patient/appointments/upcoming:
 *   get:
 *     tags: [Patient App - Appointments]
 *     summary: Upcoming confirmed appointments (ordered by date/time)
 *     description: Returns confirmed appointments only, sorted ascending by date and time.
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
 *         description: Confirmed future appointments only
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
 *                     $ref: '#/components/schemas/PatientAppointmentListItem'
 *                 meta:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *
 * /patient/appointments/book/personal:
 *   post:
 *     tags: [Patient App - Appointments]
 *     summary: Book online consultation for self
 *     description: |
 *       Personal booking endpoint. Retrieve availability from GET /patient/doctors/{id}/availability first.
 *       Payment is separate — booking without payment is allowed.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PatientBookAppointmentRequest'
 *     responses:
 *       201:
 *         description: Booked
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 data:
 *                   $ref: '#/components/schemas/PatientAppointmentListItem'
 *
 * /patient/appointments/book/family:
 *   post:
 *     tags: [Patient App - Appointments]
 *     summary: Book online consultation for family member
 *     description: Same body as personal booking plus required familyMemberId. List family members via GET /patient/family-members.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/PatientBookAppointmentRequest'
 *               - type: object
 *                 required: [familyMemberId]
 *     responses:
 *       201:
 *         description: Booked for family member
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 data:
 *                   $ref: '#/components/schemas/PatientAppointmentListItem'
 *
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
 *         name: status
 *         schema:
 *           $ref: '#/components/schemas/PatientAppointmentFilter'
 *         description: Alias for filter
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
 *         description: Each item includes doctorName, specializations, datetime, fees, paymentStatus, status, isComing
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
 *                     $ref: '#/components/schemas/PatientAppointmentListItem'
 *                 meta:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *   post:
 *     tags: [Patient App - Appointments]
 *     summary: Book clinic or remote appointment (generic)
 *     description: |
 *       Requires doctor and time slot from availability endpoints.
 *       Home visits use POST /patient/home-services instead.
 *       When paymentMode is INSURANCE, a pre-authorization request is created automatically.
 *       Payment is separate — use POST /patient/payments/initiate after booking if needed.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PatientBookAppointmentRequest'
 *     responses:
 *       201:
 *         description: Appointment booked
 *
 * /patient/appointments/{id}:
 *   get:
 *     tags: [Patient App - Appointments]
 *     summary: Appointment details
 *     description: Returns doctor data (name, specialization, yearsOfExperience, reviews, address) and appointment data (date, time, price, paymentStatus).
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         example: 1
 *     responses:
 *       200:
 *         description: Appointment detail with doctor preview
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 data:
 *                   $ref: '#/components/schemas/PatientAppointmentDetail'
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

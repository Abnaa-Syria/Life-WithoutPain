/**
 * @swagger
 * components:
 *   schemas:
 *     DoctorAppRegisterRequest:
 *       type: object
 *       required: [name, mobileNumber, password]
 *       properties:
 *         name: { type: string }
 *         specializationId: { type: integer }
 *         medicalLicenseNumber: { type: string }
 *         workPlace: { type: string }
 *         city: { type: string }
 *         mobileNumber: { type: string }
 *         password: { type: string }
 *         licenseAttachment: { type: string, format: binary }
 *     DoctorAppLoginRequest:
 *       type: object
 *       required: [mobileNumber, password]
 *       properties:
 *         mobileNumber: { type: string }
 *         password: { type: string }
 *     DoctorAppOtpRequest:
 *       type: object
 *       required: [mobileNumber, otp]
 *       properties:
 *         mobileNumber: { type: string }
 *         otp: { type: string, minLength: 6, maxLength: 6 }
 *
 * /doctor/auth/register:
 *   post:
 *     tags: [Doctor App]
 *     summary: Register doctor (mobile app)
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/DoctorAppRegisterRequest'
 *     responses:
 *       201:
 *         description: Signup submitted for approval
 *
 * /doctor/auth/verify-otp:
 *   post:
 *     tags: [Doctor App]
 *     summary: Verify OTP
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DoctorAppOtpRequest'
 *     responses:
 *       200:
 *         description: OTP verified
 *
 * /doctor/auth/login:
 *   post:
 *     tags: [Doctor App]
 *     summary: Doctor login
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DoctorAppLoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *
 * /doctor/specializations:
 *   get:
 *     tags: [Doctor App]
 *     summary: List specializations
 *     responses:
 *       200:
 *         description: List of specializations
 *
 * /doctor/availabilities:
 *   get:
 *     tags: [Doctor App]
 *     summary: Get doctor availability
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Availability slots
 *   post:
 *     tags: [Doctor App]
 *     summary: Create availability
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               morningStart: { type: string, example: "09:00" }
 *               morningEnd: { type: string, example: "12:00" }
 *               nightStart: { type: string, example: "17:00" }
 *               nightEnd: { type: string, example: "21:00" }
 *               examinationDuration: { type: integer, example: 30 }
 *               breakDuration: { type: integer, example: 10 }
 *               days:
 *                 type: array
 *                 items: { type: string, example: monday }
 *     responses:
 *       201:
 *         description: Availability created
 *
 * /doctor/appointments:
 *   get:
 *     tags: [Doctor App]
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
 *     tags: [Doctor App]
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
 *     tags: [Doctor App]
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
 *     tags: [Doctor App]
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
 *     tags: [Doctor App]
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
 *     tags: [Doctor App]
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
 *     tags: [Doctor App]
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
 *     tags: [Doctor App]
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
 * /doctor/patients:
 *   get:
 *     tags: [Doctor App]
 *     summary: List patients
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Patients list
 *
 * /doctor/patients/{id}:
 *   get:
 *     tags: [Doctor App]
 *     summary: Get patient details
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Patient details
 *
 * /doctor/prescriptions:
 *   post:
 *     tags: [Doctor App]
 *     summary: Create prescription
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               patientId: { type: integer }
 *               appointmentId: { type: integer }
 *               diagnosis: { type: string }
 *               medications:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     medicineName: { type: string }
 *                     dosage: { type: string }
 *                     frequency: { type: string }
 *                     timing: { type: string }
 *                     duration: { type: string }
 *               sideEffectsNotes: { type: string }
 *     responses:
 *       201:
 *         description: Prescription created
 *
 * /doctor/prescriptions/{id}:
 *   get:
 *     tags: [Doctor App]
 *     summary: Get prescription details
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Prescription details
 *
 * /doctor/prescriptions/{id}/pdf:
 *   get:
 *     tags: [Doctor App]
 *     summary: Download prescription PDF
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: PDF URL
 *
 * /doctor/reports:
 *   post:
 *     tags: [Doctor App]
 *     summary: Create medical report
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               patientId: { type: integer }
 *               appointmentId: { type: integer }
 *               visitReason: { type: string }
 *               symptoms: { type: string }
 *               clinicalExamination: { type: string }
 *               tests:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     testType: { type: string }
 *                     value: { type: string }
 *               nextAppointmentDate: { type: string, format: date-time }
 *     responses:
 *       201:
 *         description: Report created
 *
 * /doctor/reports/{id}:
 *   get:
 *     tags: [Doctor App]
 *     summary: Get report details
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Report details
 *
 * /doctor/reports/{id}/pdf:
 *   get:
 *     tags: [Doctor App]
 *     summary: Download report PDF
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: PDF URL
 *
 * /doctor/notifications:
 *   get:
 *     tags: [Doctor App]
 *     summary: Get notifications
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Notifications list
 *
 * /doctor/notifications/{id}/read:
 *   patch:
 *     tags: [Doctor App]
 *     summary: Mark notification as read
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Marked as read
 *
 * /doctor/profile:
 *   get:
 *     tags: [Doctor App]
 *     summary: Get personal details
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Profile
 *   patch:
 *     tags: [Doctor App]
 *     summary: Update personal details
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               identityNumber: { type: string }
 *               phoneNumber: { type: string }
 *     responses:
 *       200:
 *         description: Updated
 *
 * /doctor/clinic-details:
 *   get:
 *     tags: [Doctor App]
 *     summary: Get clinic details
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Clinic details
 *   patch:
 *     tags: [Doctor App]
 *     summary: Update clinic details
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               address: { type: string }
 *               workingHours: { type: string }
 *     responses:
 *       200:
 *         description: Updated
 *
 * /doctor/settings:
 *   get:
 *     tags: [Doctor App]
 *     summary: Get settings
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Settings
 *   patch:
 *     tags: [Doctor App]
 *     summary: Update settings
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               language: { type: string, enum: [ar, en] }
 *               notificationsEnabled: { type: boolean }
 *               privacy: { type: object }
 *     responses:
 *       200:
 *         description: Updated
 */

module.exports = {};

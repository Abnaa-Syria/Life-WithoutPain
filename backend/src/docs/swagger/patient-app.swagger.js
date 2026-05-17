/**
 * @swagger
 * components:
 *   schemas:
 *     PatientAppRegisterRequest:
 *       type: object
 *       required: [fullName, identityNumber, dateOfBirth, email, phone, password]
 *       properties:
 *         fullName: { type: string }
 *         identityNumber: { type: string, description: National ID number }
 *         dateOfBirth: { type: string, format: date, example: '1990-05-15' }
 *         email: { type: string, format: email }
 *         phone: { type: string }
 *         password: { type: string, format: password }
 *         preferredLanguage: { type: string, enum: [ar, en] }
 *     PatientAppointmentFilter:
 *       type: string
 *       enum: [all, confirmed, cancelled, completed, coming]
 *       description: |
 *         `coming` filters appointments whose datetime is soon (within PATIENT_COMING_WINDOW_HOURS).
 *         It is NOT an appointment status. Other values filter by AppointmentStatus.
 *
 * /patient/auth/register:
 *   post:
 *     tags: [Patient App]
 *     summary: Register patient
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PatientAppRegisterRequest'
 *     responses:
 *       201:
 *         description: Registered — verify phone via OTP
 *
 * /patient/auth/login:
 *   post:
 *     tags: [Patient App]
 *     summary: Login with email or phone
 *     responses:
 *       200:
 *         description: Login successful
 *
 * /patient/auth/login/mobile:
 *   post:
 *     tags: [Patient App]
 *     summary: Login with mobile number
 *     responses:
 *       200:
 *         description: Login successful
 *
 * /patient/auth/verify-otp:
 *   post:
 *     tags: [Patient App]
 *     summary: Verify OTP
 *     responses:
 *       200:
 *         description: OTP verified
 *
 * /patient/auth/me:
 *   get:
 *     tags: [Patient App]
 *     summary: Get authenticated patient account
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Current user
 *
 * /patient/insurances:
 *   get:
 *     tags: [Patient App]
 *     summary: List patient insurances
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Insurance list with company, label number, expiry, active status
 *   post:
 *     tags: [Patient App]
 *     summary: Add insurance (multipart card image)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               cardImage: { type: string, format: binary }
 *               providerId: { type: integer }
 *               policyNumber: { type: string, description: Document / policy number }
 *               memberId: { type: string }
 *               expiryDate: { type: string, format: date }
 *     responses:
 *       201:
 *         description: Insurance created
 *
 * /patient/family-members:
 *   get:
 *     tags: [Patient App]
 *     summary: List family members
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Family members with residence card number and derived age
 *   post:
 *     tags: [Patient App]
 *     summary: Add family member
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201:
 *         description: Family member created
 *
 * /patient/family-members/{id}:
 *   put:
 *     tags: [Patient App]
 *     summary: Update family member
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Updated
 *   delete:
 *     tags: [Patient App]
 *     summary: Delete family member
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Deleted
 *
 * /patient/services:
 *   get:
 *     tags: [Patient App]
 *     summary: List services (HOME, REMOTE, CLINIC)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [HOME, REMOTE, CLINIC] }
 *     responses:
 *       200:
 *         description: Service catalog
 *
 * /patient/appointments:
 *   get:
 *     tags: [Patient App]
 *     summary: List appointments (ordered by date)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: filter
 *         schema:
 *           $ref: '#/components/schemas/PatientAppointmentFilter'
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Each item includes doctor name, specializations, datetime, fees, status, isComing
 *   post:
 *     tags: [Patient App]
 *     summary: Book appointment
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
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
 *     responses:
 *       201:
 *         description: Appointment booked
 *
 * /patient/appointments/{id}:
 *   get:
 *     tags: [Patient App]
 *     summary: Appointment detail with doctor preview
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Doctor experience, rating, address, certificates
 *
 * /patient/appointments/{id}/session:
 *   get:
 *     tags: [Patient App]
 *     summary: Get or join video consultation session
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Session join URL for patient
 *
 * /patient/appointments/{id}/cancel:
 *   patch:
 *     tags: [Patient App]
 *     summary: Cancel appointment
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Cancelled
 *
 * /patient/appointments/{id}/reschedule:
 *   patch:
 *     tags: [Patient App]
 *     summary: Reschedule appointment
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Rescheduled
 *
 * /patient/directories:
 *   get:
 *     tags: [Patient App]
 *     summary: Medical directories (reports, prescriptions, x-rays)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [all, reports, prescriptions, xrays] }
 *     responses:
 *       200:
 *         description: Records with doctor details (not patient details)
 *
 * /patient/specializations:
 *   get:
 *     tags: [Patient App]
 *     summary: List all specializations
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Specialization list
 *
 * /patient/specializations/{id}/doctors:
 *   get:
 *     tags: [Patient App]
 *     summary: Doctors in specialization with available appointment count
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Doctors with availableAppointmentsCount
 *
 * /patient/doctors/search:
 *   get:
 *     tags: [Patient App]
 *     summary: Search doctors
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Doctor search results
 *
 * /patient/doctors/{id}:
 *   get:
 *     tags: [Patient App]
 *     summary: Doctor public profile with certificates
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Doctor detail
 *
 * /patient/payments/initiate:
 *   post:
 *     tags: [Patient App]
 *     summary: Initiate payment (VISA, MASTERCARD, APPLE_PAY)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               appointmentId: { type: integer }
 *               amount: { type: number }
 *               method: { type: string, enum: [VISA, MASTERCARD, APPLE_PAY, INSURANCE] }
 *     responses:
 *       201:
 *         description: Payment URL returned
 *
 * /patient/conversations:
 *   get:
 *     tags: [Patient App]
 *     summary: List chat conversations with doctors
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Conversations
 *   post:
 *     tags: [Patient App]
 *     summary: Start conversation with doctor
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201:
 *         description: Conversation created
 *
 * /patient/profile:
 *   get:
 *     tags: [Patient App]
 *     summary: Personal details (name, identity, phone, age, gender)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Profile
 *   put:
 *     tags: [Patient App]
 *     summary: Update profile
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Updated
 *
 * /patient/medical-profile:
 *   get:
 *     tags: [Patient App]
 *     summary: Medical file — chronic diseases, medicines
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Medical profile
 *   put:
 *     tags: [Patient App]
 *     summary: Update medical profile
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Updated
 *
 * /patient/files:
 *   get:
 *     tags: [Patient App]
 *     summary: List medical file attachments
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Files list
 *   post:
 *     tags: [Patient App]
 *     summary: Upload medical file attachment
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201:
 *         description: File uploaded
 *
 * /patient/settings:
 *   get:
 *     tags: [Patient App]
 *     summary: Settings (language, notifications, privacy)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Settings
 *   patch:
 *     tags: [Patient App]
 *     summary: Update settings
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Settings updated
 *
 * /patient/support/cases:
 *   get:
 *     tags: [Patient App]
 *     summary: List support tickets
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Support cases
 *   post:
 *     tags: [Patient App]
 *     summary: Contact support team
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201:
 *         description: Support case created
 *
 * /patient/support/cases/{id}/messages:
 *   get:
 *     tags: [Patient App]
 *     summary: Support case messages
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Messages thread
 *   post:
 *     tags: [Patient App]
 *     summary: Send support message
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201:
 *         description: Message sent
 */

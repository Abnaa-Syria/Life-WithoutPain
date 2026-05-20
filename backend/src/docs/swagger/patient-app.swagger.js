/**
 * @swagger
 * components:
 *   schemas:
 *     PatientAppRegisterRequest:
 *       type: object
 *       required: [fullName, identityNumber, dateOfBirth, email, phone, password]
 *       properties:
 *         fullName: { type: string, example: 'أحمد محمد' }
 *         identityNumber: { type: string, description: National ID number, example: '1234567890' }
 *         dateOfBirth: { type: string, format: date, example: '1990-05-15' }
 *         email: { type: string, format: email, example: 'patient@example.com' }
 *         phone: { type: string, example: '+966500000001' }
 *         password: { type: string, format: password, example: 'Password123' }
 *         preferredLanguage: { type: string, enum: [ar, en], example: ar }
 *     PatientAppointmentFilter:
 *       type: string
 *       enum: [all, confirmed, cancelled, completed, coming]
 *       example: all
 *       description: |
 *         `coming` filters appointments whose datetime is soon (within PATIENT_COMING_WINDOW_HOURS).
 *         It is NOT an appointment status. Other values filter by AppointmentStatus.
 *     MedicalCatalogItem:
 *       type: object
 *       properties:
 *         id: { type: integer }
 *         nameAr: { type: string }
 *         nameEn: { type: string }
 *         description: { type: string, nullable: true }
 *     MedicalProfileAttachment:
 *       type: object
 *       properties:
 *         id: { type: integer }
 *         fileUrl: { type: string }
 *         mimeType: { type: string }
 *         title: { type: string }
 *         createdAt: { type: string, format: date-time }
 *     MedicalProfile:
 *       type: object
 *       properties:
 *         id: { type: integer }
 *         patientId: { type: integer }
 *         chronicDiseaseIds: { type: array, items: { type: integer } }
 *         chronicDiseases: { type: array, items: { $ref: '#/components/schemas/MedicalCatalogItem' } }
 *         medicationIds: { type: array, items: { type: integer } }
 *         medications: { type: array, items: { $ref: '#/components/schemas/MedicalCatalogItem' } }
 *         allergyIds: { type: array, items: { type: integer } }
 *         allergies: { type: array, items: { $ref: '#/components/schemas/MedicalCatalogItem' } }
 *         reportAttachments: { type: array, items: { $ref: '#/components/schemas/MedicalProfileAttachment' } }
 *         surgeries: { type: string, nullable: true }
 *         familyHistory: { type: string, nullable: true }
 *         notes: { type: string, nullable: true }
 *
 * /patient/auth/register:
 *   post:
 *     tags: [Patient App]
 *     summary: Register patient
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PatientAppRegisterRequest'
 *           example:
 *             fullName: 'أحمد محمد'
 *             identityNumber: '1234567890'
 *             dateOfBirth: '1990-05-15'
 *             email: patient@example.com
 *             phone: '+966500000001'
 *             password: 'Password123'
 *             preferredLanguage: ar
 *     responses:
 *       201:
 *         description: Registered — verify phone via OTP
 *
 * /patient/auth/login:
 *   post:
 *     tags: [Patient App]
 *     summary: Login with email or phone
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [identifier, password]
 *             properties:
 *               identifier: { type: string, description: Email or phone }
 *               password: { type: string }
 *           example:
 *             identifier: patient@example.com
 *             password: 'Password123'
 *     responses:
 *       200:
 *         description: Login successful
 *
 * /patient/auth/login/mobile:
 *   post:
 *     tags: [Patient App]
 *     summary: Login with mobile number
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [phone, password]
 *             properties:
 *               phone: { type: string }
 *               password: { type: string, minLength: 6 }
 *           example:
 *             phone: '+966500000001'
 *             password: 'Password123'
 *     responses:
 *       200:
 *         description: Login successful
 *
 * /patient/auth/verify-otp:
 *   post:
 *     tags: [Patient App]
 *     summary: Verify OTP
 *     description: Use stub code `12345` when OTP provider is mock (until SMS verification is implemented).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, code]
 *             properties:
 *               userId: { type: integer }
 *               code: { type: string, minLength: 5, maxLength: 5, description: Dev stub is 12345 }
 *               purpose: { type: string, enum: [verification, password_reset], default: verification }
 *           example:
 *             userId: 1
 *             code: '12345'
 *             purpose: verification
 *     responses:
 *       200:
 *         description: OTP verified
 *
 * /patient/auth/resend-otp:
 *   post:
 *     tags: [Patient App]
 *     summary: Resend OTP
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId]
 *             properties:
 *               userId: { type: integer }
 *               purpose: { type: string, enum: [verification, password_reset], default: verification }
 *           example:
 *             userId: 1
 *             purpose: verification
 *     responses:
 *       200:
 *         description: OTP resent
 *
 * /patient/auth/refresh-token:
 *   post:
 *     tags: [Patient App]
 *     summary: Refresh access token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken: { type: string }
 *           example:
 *             refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example'
 *     responses:
 *       200:
 *         description: Token refreshed
 *
 * /patient/auth/forgot-password:
 *   post:
 *     tags: [Patient App]
 *     summary: Request password reset OTP
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, format: email }
 *           example:
 *             email: patient@example.com
 *     responses:
 *       200:
 *         description: Reset OTP sent
 *
 * /patient/auth/reset-password:
 *   post:
 *     tags: [Patient App]
 *     summary: Reset password with OTP
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, code, newPassword]
 *             properties:
 *               userId: { type: integer }
 *               code: { type: string, minLength: 6, maxLength: 6 }
 *               newPassword: { type: string, format: password }
 *           example:
 *             userId: 1
 *             code: '654321'
 *             newPassword: 'NewPassword123'
 *     responses:
 *       200:
 *         description: Password reset successful
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
 *       required: true
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
 *           example:
 *             providerId: 1
 *             policyNumber: 'POL-2024-001'
 *             memberId: 'MEM-12345'
 *             expiryDate: '2026-12-31'
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fullName, relationType]
 *             properties:
 *               fullName: { type: string }
 *               residenceCardNumber: { type: string }
 *               relationType: { type: string }
 *               gender: { type: string, enum: [MALE, FEMALE] }
 *               dateOfBirth: { type: string, format: date }
 *               phone: { type: string }
 *               notes: { type: string }
 *           example:
 *             fullName: 'سارة أحمد'
 *             residenceCardNumber: '9876543210'
 *             relationType: 'daughter'
 *             gender: FEMALE
 *             dateOfBirth: '2015-03-10'
 *             phone: '+966500000002'
 *     responses:
 *       201:
 *         description: Family member created
 *
 * /patient/family-members/{id}:
 *   put:
 *     tags: [Patient App]
 *     summary: Update family member
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
 *             properties:
 *               fullName: { type: string }
 *               relationType: { type: string }
 *               phone: { type: string }
 *           example:
 *             fullName: 'سارة أحمد'
 *             relationType: 'daughter'
 *             phone: '+966500000002'
 *     responses:
 *       200:
 *         description: Updated
 *   delete:
 *     tags: [Patient App]
 *     summary: Delete family member
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         example: 1
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
 *         example: CLINIC
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
 *     tags: [Patient App]
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
 *     tags: [Patient App]
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
 *     tags: [Patient App]
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
 *     tags: [Patient App]
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
 *     tags: [Patient App]
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
 * /patient/directories:
 *   get:
 *     tags: [Patient App]
 *     summary: Medical directories (reports, prescriptions, x-rays)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [all, reports, prescriptions, xrays] }
 *         example: all
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
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         example: 1
 *     responses:
 *       200:
 *         description: Doctors with availableAppointmentsCount
 *
 * /patient/doctors/search:
 *   get:
 *     tags: [Patient App]
 *     summary: Search doctors
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         example: cardiology
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
 *         description: Doctor search results
 *
 * /patient/doctors/{id}:
 *   get:
 *     tags: [Patient App]
 *     summary: Doctor public profile with certificates
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         example: 1
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
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               appointmentId: { type: integer }
 *               amount: { type: number }
 *               method: { type: string, enum: [VISA, MASTERCARD, APPLE_PAY, INSURANCE] }
 *           example:
 *             appointmentId: 1
 *             amount: 250
 *             method: VISA
 *     responses:
 *       201:
 *         description: Payment URL returned
 *
 * /patient/conversations:
 *   get:
 *     tags: [Patient App]
 *     summary: List chat conversations with doctors
 *     security: [{ bearerAuth: [] }]
 *     parameters:
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
 *         description: Conversations
 *   post:
 *     tags: [Patient App]
 *     summary: Start conversation with doctor
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [doctorId]
 *             properties:
 *               doctorId: { type: integer }
 *               appointmentId: { type: integer }
 *           example:
 *             doctorId: 1
 *             appointmentId: 1
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName: { type: string }
 *               gender: { type: string, enum: [MALE, FEMALE] }
 *               dateOfBirth: { type: string, format: date }
 *               city: { type: string }
 *               address: { type: string }
 *               identityNumber: { type: string }
 *           example:
 *             fullName: 'أحمد محمد'
 *             gender: MALE
 *             dateOfBirth: '1990-05-15'
 *             city: 'Riyadh'
 *             address: '123 Main St'
 *     responses:
 *       200:
 *         description: Updated
 *
 * /patient/medical-profile:
 *   get:
 *     tags: [Patient App]
 *     summary: Get medical profile (catalog IDs and resolved items)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Medical profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/MedicalProfile'
 *   put:
 *     tags: [Patient App]
 *     summary: Update medical profile
 *     security: [{ bearerAuth: [] }]
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
 *           example:
 *             chronicDiseaseIds: [1]
 *             medicationIds: [1]
 *             allergyIds: [1]
 *             notes: 'No recent surgeries'
 *     responses:
 *       200:
 *         description: Updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/MedicalProfile'
 *
 * /patient/medical-profile/attachments:
 *   post:
 *     tags: [Patient App]
 *     summary: Upload medical report attachments (one or more)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files: { type: array, items: { type: string, format: binary } }
 *               titles: { type: array, items: { type: string } }
 *     responses:
 *       201:
 *         description: Attachments uploaded
 *
 * /patient/medical-profile/attachments/{attachmentId}:
 *   delete:
 *     tags: [Patient App]
 *     summary: Delete a medical profile report attachment
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: attachmentId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Attachment deleted
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
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file: { type: string, format: binary }
 *               title: { type: string }
 *               category: { type: string }
 *           example:
 *             title: 'Lab results'
 *             category: 'LAB_RESULT'
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               preferredLanguage: { type: string, enum: [ar, en] }
 *               notificationsEnabled: { type: boolean }
 *               darkModeEnabled: { type: boolean }
 *               privacy: { type: object }
 *           example:
 *             preferredLanguage: ar
 *             notificationsEnabled: true
 *             darkModeEnabled: false
 *     responses:
 *       200:
 *         description: Settings updated
 *
 * /patient/support/cases:
 *   get:
 *     tags: [Patient App]
 *     summary: List support tickets
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *         example: 20
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *         example: OPEN
 *     responses:
 *       200:
 *         description: Support cases
 *   post:
 *     tags: [Patient App]
 *     summary: Contact support team
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [subject, description]
 *             properties:
 *               subject: { type: string }
 *               description: { type: string }
 *               type: { type: string }
 *               priority: { type: string }
 *           example:
 *             subject: 'Payment issue'
 *             description: 'I was charged twice for my appointment.'
 *             type: GENERAL
 *             priority: MEDIUM
 *     responses:
 *       201:
 *         description: Support case created
 *
 * /patient/support/cases/{id}/messages:
 *   get:
 *     tags: [Patient App]
 *     summary: Support case messages
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         example: 1
 *     responses:
 *       200:
 *         description: Messages thread
 *   post:
 *     tags: [Patient App]
 *     summary: Send support message
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
 *             required: [content]
 *             properties:
 *               content: { type: string }
 *           example:
 *             content: 'Here is more detail about the payment problem.'
 *     responses:
 *       201:
 *         description: Message sent
 */

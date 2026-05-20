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
 *     MedicalProfileAttachmentUpload:
 *       type: object
 *       properties:
 *         file:
 *           type: string
 *           format: binary
 *           description: Single report file (Swagger Try it out). Use field `files` for multiple uploads.
 *         files:
 *           type: string
 *           format: binary
 *           description: One or more report files (repeat this part for multiple files).
 *         title: { type: string }
 *         titles: { type: string, description: 'Optional JSON array of titles aligned with uploaded files' }
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
 *     PatientLoginPatientDto:
 *       type: object
 *       properties:
 *         id: { type: integer }
 *         userId: { type: integer }
 *         fullName: { type: string }
 *         email: { type: string }
 *         phone: { type: string }
 *         avatarUrl: { type: string, nullable: true }
 *         isVerified: { type: boolean }
 *         preferredLanguage: { type: string }
 *         darkModeEnabled: { type: boolean }
 *         identityNumber: { type: string, nullable: true }
 *         dateOfBirth: { type: string, format: date, nullable: true }
 *         gender: { type: string, nullable: true }
 *         city: { type: string, nullable: true }
 *     PatientLoginResponseDto:
 *       type: object
 *       properties:
 *         token: { type: string, description: JWT access token }
 *         refreshToken: { type: string }
 *         patient:
 *           $ref: '#/components/schemas/PatientLoginPatientDto'
 *
 */

module.exports = {};

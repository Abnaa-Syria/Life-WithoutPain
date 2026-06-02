/**
 * @swagger
 * components:
 *   schemas:
 *     PatientAppRegisterRequest:
 *       type: object
 *       required: [identityNumber, dateOfBirth, email, password]
 *       description: |
 *         Provide `fullName` or `name`, and `phone` or `phoneNumber`.
 *       properties:
 *         fullName: { type: string, example: 'أحمد محمد', description: Figma alias — name }
 *         name: { type: string, example: 'أحمد محمد', description: Alias for fullName }
 *         identityNumber: { type: string, description: National ID number, example: '1234567890' }
 *         dateOfBirth: { type: string, format: date, example: '1990-05-15' }
 *         email: { type: string, format: email, example: 'patient@example.com' }
 *         phone: { type: string, example: '+966500000001', description: Figma alias — phoneNumber }
 *         phoneNumber: { type: string, example: '+966500000001', description: Alias for phone }
 *         password: { type: string, format: password, example: 'Password123' }
 *         preferredLanguage: { type: string, enum: [ar, en], example: ar }
 *     PatientRegisterResponseDto:
 *       type: object
 *       properties:
 *         id: { type: integer, description: User id — pass as userId to verify-otp }
 *         fullName: { type: string }
 *         email: { type: string }
 *         phone: { type: string }
 *         role: { type: string, example: PATIENT }
 *         isVerified: { type: boolean, example: false }
 *     PatientAppointmentFilter:
 *       type: string
 *       enum: [all, confirmed, cancelled, completed, finished, coming]
 *       example: all
 *       description: |
 *         `finished` is an alias for `completed`. `coming` filters appointments whose datetime is soon.
 *     SubSpecializationItem:
 *       type: object
 *       properties:
 *         id: { type: integer }
 *         specialityId: { type: integer }
 *         nameAr: { type: string }
 *         nameEn: { type: string }
 *     SpecializationWithSubs:
 *       type: object
 *       properties:
 *         id: { type: integer }
 *         nameAr: { type: string }
 *         nameEn: { type: string }
 *         subSpecializations:
 *           type: array
 *           items: { $ref: '#/components/schemas/SubSpecializationItem' }
 *     PatientBookAppointmentRequest:
 *       type: object
 *       required: [doctorId, appointmentDate, startTime, endTime]
 *       description: |
 *         Retrieve doctor availability from GET /patient/doctors/{id}/availability before booking.
 *         Payment is separate — use POST /patient/payments/initiate after booking if needed.
 *       properties:
 *         doctorId: { type: integer }
 *         serviceId: { type: integer }
 *         appointmentDate: { type: string, format: date, description: Figma alias — date }
 *         startTime: { type: string, example: '09:00', description: Selected slot start (Figma — time) }
 *         endTime: { type: string, example: '09:30' }
 *         bookingFor: { type: string, enum: [personal, family], description: Used on POST /patient/appointments only }
 *         familyMemberId: { type: integer, description: Required on POST /patient/appointments/book/family }
 *         paymentMode: { type: string, enum: [DIRECT, INSURANCE] }
 *         bookingMethod: { type: string, enum: [medicalInsurance, directPayment], description: Alias for paymentMode }
 *         notes: { type: string }
 *     PatientApiFieldGlossary:
 *       type: object
 *       description: |
 *         Figma / mobile spec name → API field name:
 *         phoneNumber → phone; name → fullName; bookingMethod → paymentMode;
 *         medicalInsurance → INSURANCE; directPayment → DIRECT; finished → completed;
 *         insuranceProviderId → providerId; insuranceCardImage → cardImage;
 *         insuranceCreditNumber → policyNumber; insuranceExpiryDate → expiryDate;
 *         relationship → relationType; name → fullName; address → visitAddress;
 *         date → preferredDate; additionalNotes → notes; bookingType → paymentMode;
 *         specializationId → specialityId; status → filter (bookings list).
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
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 *     PatientProfileDto:
 *       type: object
 *       properties:
 *         id: { type: integer }
 *         userId: { type: integer }
 *         fullName: { type: string }
 *         identityNumber: { type: string, nullable: true }
 *         email: { type: string }
 *         phone: { type: string }
 *         gender: { type: string, enum: [MALE, FEMALE], nullable: true }
 *         dateOfBirth: { type: string, format: date, nullable: true }
 *         age: { type: integer, nullable: true, description: Derived from dateOfBirth }
 *         avatarUrl: { type: string, nullable: true }
 *         city: { type: string, nullable: true }
 *         address: { type: string, nullable: true }
 *         preferredLanguage: { type: string, enum: [ar, en] }
 *     PatientInsuranceDto:
 *       type: object
 *       properties:
 *         id: { type: integer }
 *         insuranceCompany:
 *           type: object
 *           nullable: true
 *           properties:
 *             id: { type: integer }
 *             nameAr: { type: string }
 *             nameEn: { type: string }
 *             logoUrl: { type: string, nullable: true }
 *         labelNumber: { type: string, description: Policy or member id (Figma — insuranceCreditNumber) }
 *         memberId: { type: string, nullable: true }
 *         expiryDate: { type: string, format: date, nullable: true }
 *         attachmentUrl: { type: string, nullable: true, description: Uploaded card image URL (Figma — insuranceCardImage) }
 *         verificationStatus: { type: string }
 *         isActive: { type: boolean }
 *         isPrimary: { type: boolean }
 *     PatientFamilyMemberDto:
 *       type: object
 *       properties:
 *         id: { type: integer }
 *         fullName: { type: string, description: Figma alias — name }
 *         residenceCardNumber: { type: string, nullable: true }
 *         relationType: { type: string, description: Figma alias — relationship }
 *         gender: { type: string, enum: [MALE, FEMALE], nullable: true }
 *         dateOfBirth: { type: string, format: date, nullable: true }
 *         age: { type: integer, nullable: true, description: Derived from dateOfBirth }
 *         phone: { type: string, nullable: true }
 *         notes: { type: string, nullable: true }
 *     PatientDoctorListItem:
 *       type: object
 *       properties:
 *         id: { type: integer }
 *         doctorName: { type: string }
 *         avatarUrl: { type: string, nullable: true }
 *         specialization: { $ref: '#/components/schemas/SpecializationWithSubs' }
 *         subSpecializations:
 *           type: array
 *           items: { $ref: '#/components/schemas/SubSpecializationItem' }
 *         yearsOfExperience: { type: integer, nullable: true }
 *         consultationPrice: { type: number, nullable: true }
 *         rating:
 *           type: object
 *           properties:
 *             average: { type: number, nullable: true }
 *             count: { type: integer }
 *         city: { type: string, nullable: true }
 *         address: { type: string, nullable: true }
 *         totalAppointmentsCount: { type: integer }
 *         availableAppointmentsCount: { type: integer, nullable: true }
 *     PatientDoctorDetail:
 *       allOf:
 *         - $ref: '#/components/schemas/PatientDoctorListItem'
 *         - type: object
 *           properties:
 *             bio: { type: string, nullable: true }
 *             bioAr: { type: string, nullable: true }
 *             reviews:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id: { type: integer }
 *                   rating: { type: integer }
 *                   comment: { type: string, nullable: true }
 *                   patientName: { type: string, nullable: true }
 *                   createdAt: { type: string, format: date-time }
 *             certificates:
 *               type: array
 *               description: Certificate names only — file URLs are admin-only
 *               items:
 *                 type: object
 *                 properties:
 *                   id: { type: integer }
 *                   name: { type: string }
 *                   fileType: { type: string, nullable: true }
 *             workingHours: { type: array, items: { type: object } }
 *     PatientAppointmentListItem:
 *       type: object
 *       properties:
 *         id: { type: integer }
 *         doctorName: { type: string, nullable: true }
 *         specializations:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id: { type: integer }
 *               nameAr: { type: string }
 *               nameEn: { type: string }
 *         appointmentDate: { type: string, format: date }
 *         startTime: { type: string }
 *         endTime: { type: string }
 *         fees: { type: number, nullable: true, description: Consultation price }
 *         price: { type: number, nullable: true, description: Same as fees on detail view }
 *         paymentStatus: { type: string, example: PENDING }
 *         status: { type: string }
 *         isComing: { type: boolean }
 *         familyMemberId: { type: integer, nullable: true }
 *         service:
 *           type: object
 *           nullable: true
 *           properties:
 *             id: { type: integer }
 *             nameAr: { type: string }
 *             nameEn: { type: string }
 *             type: { type: string, enum: [HOME, REMOTE, CLINIC] }
 *     PatientAppointmentDetail:
 *       allOf:
 *         - $ref: '#/components/schemas/PatientAppointmentListItem'
 *         - type: object
 *           properties:
 *             notes: { type: string, nullable: true }
 *             doctor: { $ref: '#/components/schemas/PatientDoctorDetail' }
 *     PatientBookingListItem:
 *       type: object
 *       properties:
 *         bookingType: { type: string, enum: [appointment, homeService] }
 *         serviceType: { type: string, enum: [HOME, REMOTE, CLINIC] }
 *         id: { type: integer }
 *         paymentStatus: { type: string }
 *         status: { type: string }
 *         appointmentDate: { type: string, format: date, nullable: true }
 *         preferredDate: { type: string, format: date, nullable: true }
 *         doctorName: { type: string, nullable: true }
 *         visitAddress: { type: string, nullable: true }
 *     PatientPrescriptionListItem:
 *       type: object
 *       properties:
 *         id: { type: integer }
 *         doctorName: { type: string, nullable: true }
 *         specialization: { $ref: '#/components/schemas/SpecializationWithSubs' }
 *         summary: { type: string, nullable: true }
 *         appointmentDateTime: { type: string, format: date-time, nullable: true }
 *         createdAt: { type: string, format: date-time }
 *     PatientPrescriptionDetail:
 *       type: object
 *       properties:
 *         id: { type: integer }
 *         doctorName: { type: string, nullable: true }
 *         appointmentDate: { type: string, format: date, nullable: true }
 *         prescriptionNumber: { type: string }
 *         summary: { type: string, nullable: true }
 *         diagnosis: { type: string, nullable: true }
 *         appointmentDateTime: { type: string, format: date-time, nullable: true }
 *         medicines:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               medicineName: { type: string }
 *               description: { type: string, nullable: true }
 *               dosage: { type: string, nullable: true }
 *               frequency: { type: string, nullable: true }
 *               duration: { type: string, nullable: true }
 *               timing: { type: string, nullable: true }
 *               sideEffectsNotes: { type: string, nullable: true }
 *         pdfUrl: { type: string, nullable: true }
 *     PatientReportListItem:
 *       type: object
 *       properties:
 *         id: { type: integer }
 *         doctorName: { type: string, nullable: true }
 *         specialization: { $ref: '#/components/schemas/SpecializationWithSubs' }
 *         summary: { type: string, nullable: true }
 *         appointmentDateTime: { type: string, format: date-time, nullable: true }
 *         createdAt: { type: string, format: date-time }
 *     PatientReportDetail:
 *       type: object
 *       properties:
 *         id: { type: integer }
 *         doctorName: { type: string, nullable: true }
 *         specialization: { $ref: '#/components/schemas/SpecializationWithSubs' }
 *         prescriptionNumber: { type: string, nullable: true }
 *         appointmentDateTime: { type: string, format: date-time, nullable: true }
 *         visitReason: { type: string, nullable: true }
 *         summary: { type: string, nullable: true }
 *         symptoms: { type: string, nullable: true }
 *         clinicalTests: { type: object, nullable: true, description: Test name and value pairs }
 *         resultSummary: { type: string, nullable: true }
 *         results: { type: object, nullable: true }
 *         nextAppointmentDate: { type: string, format: date, nullable: true }
 *         attachments: { type: array, items: { type: object } }
 *         pdfUrl: { type: string, nullable: true }
 *     PatientXrayListItem:
 *       type: object
 *       properties:
 *         id: { type: integer }
 *         doctorName: { type: string, nullable: true }
 *         specialization: { $ref: '#/components/schemas/SpecializationWithSubs' }
 *         summary: { type: string, nullable: true }
 *         createdAt: { type: string, format: date-time }
 *         uploadedFile: { type: string, nullable: true }
 *     PatientXrayDetail:
 *       allOf:
 *         - $ref: '#/components/schemas/PatientXrayListItem'
 *         - type: object
 *           properties:
 *             pdfUrl: { type: string, nullable: true }
 *             mimeType: { type: string, nullable: true }
 *     PatientLabTestListItem:
 *       type: object
 *       properties:
 *         id: { type: integer }
 *         doctorName: { type: string, nullable: true }
 *         specialization: { $ref: '#/components/schemas/SpecializationWithSubs' }
 *         summary: { type: string, nullable: true }
 *         createdAt: { type: string, format: date-time }
 *     PatientTimelineItem:
 *       type: object
 *       properties:
 *         recordType: { type: string, enum: [report, prescription, xray, labTest] }
 *         id: { type: integer }
 *         summary: { type: string, nullable: true }
 *         createdAt: { type: string, format: date-time }
 *         uploadedFile: { type: string, nullable: true }
 *     PatientNotificationItem:
 *       type: object
 *       properties:
 *         id: { type: integer }
 *         title: { type: string }
 *         body: { type: string }
 *         type: { type: string }
 *         isRead: { type: boolean }
 *         createdAt: { type: string, format: date-time }
 *         metadata: { type: object, nullable: true }
 *     PatientPaymentInitiateRequest:
 *       type: object
 *       description: |
 *         Provide exactly one of appointmentId or homeServiceRequestId.
 *         Payment is separate from booking — appointments can be booked without payment.
 *         Mock provider auto-accepts as PAID; TODO replace with real gateway integration.
 *       properties:
 *         appointmentId: { type: integer }
 *         homeServiceRequestId: { type: integer }
 *         amount: { type: number }
 *         currency: { type: string, example: SAR }
 *         description: { type: string }
 *         method: { type: string, enum: [VISA, MASTERCARD, APPLE_PAY] }
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

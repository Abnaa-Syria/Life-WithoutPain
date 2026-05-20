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
 *     DoctorLoginResponseDto:
 *       type: object
 *       properties:
 *         token: { type: string, description: JWT access token }
 *         refreshToken: { type: string }
 *         doctor:
 *           type: object
 *           nullable: true
 *           description: Doctor profile with speciality and user fields
 *
 */

module.exports = {};

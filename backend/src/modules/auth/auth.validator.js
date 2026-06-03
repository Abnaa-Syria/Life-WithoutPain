const { z } = require('zod');
const { emailSchema, passwordSchema, phoneSchema } = require('../../shared/validators/common');

const registerPatientSchema = z
  .object({
    fullName: z.string().min(2).max(255).optional(),
    name: z.string().min(2).max(255).optional(),
    identityNumber: z.string().min(3).max(50),
    dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'dateOfBirth must be YYYY-MM-DD'),
    email: emailSchema,
    phone: phoneSchema.optional(),
    phoneNumber: phoneSchema.optional(),
    password: passwordSchema,
    preferredLanguage: z.enum(['ar', 'en']).default('ar'),
  })
  .transform((data) => ({
    fullName: data.fullName || data.name,
    identityNumber: data.identityNumber,
    dateOfBirth: data.dateOfBirth,
    email: data.email,
    phone: data.phone || data.phoneNumber,
    password: data.password,
    preferredLanguage: data.preferredLanguage,
  }))
  .refine((data) => data.fullName && data.phone, {
    message: 'REGISTRATION_FIELDS_REQUIRED',
  });

const registerDoctorSchema = z.object({
  fullName: z.string().min(2).max(255),
  email: emailSchema,
  phone: phoneSchema,
  password: passwordSchema,
  licenceNumber: z.string().min(3).max(100), // رقم الترخيص الطبي
  licenceExpiryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'licenceExpiryDate must be YYYY-MM-DD').optional(),
  specialityId: z.number().int().positive().optional(),
  subSpecializationIds: z.array(z.number().int().positive()).optional(),
  licenseNumber: z.string().min(3).max(100), // رقم الترخيص الطبي (backup alias)
  licenseExpiryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'licenseExpiryDate must be YYYY-MM-DD'),
  title: z.string().min(2).max(100).optional(),
  workplace: z.string().min(2).max(255).optional(),
  city: z.string().min(2).max(100).optional(),
  preferredLanguage: z.enum(['ar', 'en']).default('ar'),
});

const loginSchema = z.object({
  identifier: z.string().min(1),
  password: z.string().min(1),
});

const mobileLoginSchema = z
  .object({
    phone: z.string().min(10).max(20).optional(),
    phoneNumber: z.string().min(10).max(20).optional(),
    password: z.string().min(6),
  })
  .transform((data) => ({
    phone: data.phone || data.phoneNumber,
    password: data.password,
  }))
  .refine((data) => data.phone, { message: 'REQUIRED' });

const preferredLanguageSchema = z.object({
  preferredLanguage: z.enum(['ar', 'en'], { message: 'PREFERRED_LANGUAGE_INVALID' }),
});

const verifyOtpSchema = z.object({
  userId: z.number().int().positive(),
  code: z.string().length(5, 'OTP must be 5 digits'),
  purpose: z.enum(['verification', 'password_reset']).default('verification'),
});

const resendOtpSchema = z.object({
  userId: z.number().int().positive(),
  purpose: z.enum(['verification', 'password_reset']).default('verification'),
});

const forgotPasswordSchema = z.object({
  email: emailSchema,
});

const resetPasswordSchema = z.object({
  userId: z.number().int().positive(),
  code: z.string().length(6),
  newPassword: passwordSchema,
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: passwordSchema,
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

module.exports = {
  registerPatientSchema,
  registerDoctorSchema,
  loginSchema,
  mobileLoginSchema,
  verifyOtpSchema,
  resendOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  refreshTokenSchema,
  preferredLanguageSchema,
};

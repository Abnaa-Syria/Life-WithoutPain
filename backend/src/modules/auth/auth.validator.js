const { z } = require('zod');
const { emailSchema, passwordSchema, phoneSchema } = require('../../shared/validators/common');

const registerPatientSchema = z.object({
  fullName: z.string().min(2).max(255),
  email: emailSchema,
  phone: phoneSchema,
  password: passwordSchema,
  preferredLanguage: z.enum(['ar', 'en']).default('ar'),
});

const registerDoctorSchema = z.object({
  fullName: z.string().min(2).max(255),
  email: emailSchema,
  phone: phoneSchema,
  password: passwordSchema,
  specialityId: z.number().int().positive().optional(),
  licenseNumber: z.string().min(3).max(100).optional(),
  title: z.string().min(2).max(100).optional(),
  workplace: z.string().min(2).max(255).optional(),
  city: z.string().min(2).max(100).optional(),
  preferredLanguage: z.enum(['ar', 'en']).default('ar'),
});

const loginSchema = z.object({
  identifier: z.string().min(1),
  password: z.string().min(1),
});

const verifyOtpSchema = z.object({
  userId: z.number().int().positive(),
  code: z.string().length(6),
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
  verifyOtpSchema,
  resendOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  refreshTokenSchema,
};

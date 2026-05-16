const { z } = require('zod');
const { passwordSchema, phoneSchema } = require('../../shared/validators/common');

const registerDoctorMobileSchema = z.object({
  name: z.string().min(2).max(255),
  specializationId: z.coerce.number().int().positive().optional(),
  medicalLicenseNumber: z.string().min(3).max(100).optional(),
  workPlace: z.string().min(2).max(255).optional(),
  city: z.string().min(2).max(100).optional(),
  mobileNumber: phoneSchema,
  password: passwordSchema,
});

const loginDoctorMobileSchema = z.object({
  mobileNumber: z.string().min(1),
  password: z.string().min(1),
});

const verifyOtpMobileSchema = z.object({
  mobileNumber: z.string().min(1),
  otp: z.string().length(6),
});

module.exports = {
  registerDoctorMobileSchema,
  loginDoctorMobileSchema,
  verifyOtpMobileSchema,
};

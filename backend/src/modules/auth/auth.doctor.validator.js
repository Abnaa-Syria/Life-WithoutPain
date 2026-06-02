const { z } = require('zod');
const { passwordSchema, phoneSchema } = require('../../shared/validators/common');

const registerDoctorMobileSchema = z.object({
  name: z.string().min(2).max(255),
  specializationId: z.coerce.number().int().positive().optional(),
  subSpecializationIds: z.union([
    z.array(z.coerce.number().int().positive()),
    z.string().transform((s) => {
      try {
        const parsed = JSON.parse(s);
        return Array.isArray(parsed) ? parsed.map((n) => parseInt(n, 10)) : [];
      } catch {
        return s.split(',').map((x) => parseInt(x.trim(), 10)).filter((n) => n > 0);
      }
    }),
  ]).optional(),
  medicalLicenseNumber: z.string().min(3).max(100).optional(),
  medicalLicenseExpiryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'medicalLicenseExpiryDate must be YYYY-MM-DD'),
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

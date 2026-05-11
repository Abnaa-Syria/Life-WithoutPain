const { z } = require('zod');

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
});

const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const phoneSchema = z.string().regex(/^\+?[0-9]{9,15}$/, 'Invalid phone number format');

const emailSchema = z.string().email('Invalid email format').toLowerCase();

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

const dateSchema = z.coerce.date();

const bilingualFieldSchema = (maxLength = 255) =>
  z.object({
    ar: z.string().min(1).max(maxLength),
    en: z.string().min(1).max(maxLength),
  });

module.exports = {
  paginationSchema,
  idParamSchema,
  phoneSchema,
  emailSchema,
  passwordSchema,
  dateSchema,
  bilingualFieldSchema,
};

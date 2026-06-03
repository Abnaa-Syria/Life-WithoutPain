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

const phoneSchema = z.string().regex(/^\+?[0-9]{9,15}$/, 'INVALID_PHONE');

const emailSchema = z.string().email('INVALID_EMAIL').toLowerCase();

const passwordSchema = z
  .string()
  .min(8, 'PASSWORD_MIN_LENGTH')
  .regex(/[A-Z]/, 'PASSWORD_UPPERCASE')
  .regex(/[a-z]/, 'PASSWORD_LOWERCASE')
  .regex(/[0-9]/, 'PASSWORD_NUMBER');

const dateSchema = z.coerce.date();

const bilingualFieldSchema = (maxLength = 255) =>
  z.object({
    ar: z.string().min(1).max(maxLength),
    en: z.string().min(1).max(maxLength),
  });

const translationsSchema = (fields = ['name'], maxLength = 255) => {
  const localeShape = {};
  for (const field of fields) {
    localeShape[field] = z.string().min(1).max(maxLength === Infinity ? 10000 : maxLength).optional();
  }
  return z.object({
    en: z.object(localeShape),
    ar: z.object(localeShape),
  });
};

module.exports = {
  paginationSchema,
  idParamSchema,
  phoneSchema,
  emailSchema,
  passwordSchema,
  dateSchema,
  bilingualFieldSchema,
  translationsSchema,
};

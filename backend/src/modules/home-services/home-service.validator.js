const { z } = require('zod');

const createHomeServiceSchema = z.object({
  serviceId: z.number().int().positive(),
  visitAddress: z.string().min(3).max(2000),
  notes: z.string().max(5000).optional(),
  preferredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'preferredDate must be YYYY-MM-DD'),
  paymentMode: z.enum(['DIRECT', 'INSURANCE']),
});

const cancelHomeServiceSchema = z.object({
  reason: z.string().max(2000).optional(),
});

const homeServiceIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

module.exports = {
  createHomeServiceSchema,
  cancelHomeServiceSchema,
  homeServiceIdParamSchema,
};

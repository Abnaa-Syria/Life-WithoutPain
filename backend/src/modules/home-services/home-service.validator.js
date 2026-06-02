const { z } = require('zod');

const createHomeServiceSchema = z
  .object({
    serviceId: z.number().int().positive(),
    visitAddress: z.string().min(3).max(2000).optional(),
    address: z.string().min(3).max(2000).optional(),
    notes: z.string().max(5000).optional(),
    additionalNotes: z.string().max(5000).optional(),
    preferredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'preferredDate must be YYYY-MM-DD').optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be YYYY-MM-DD').optional(),
    paymentMode: z.enum(['DIRECT', 'INSURANCE']).optional(),
    bookingType: z.enum(['medicalInsurance', 'directPayment', 'DIRECT', 'INSURANCE']).optional(),
    bookingMethod: z.enum(['medicalInsurance', 'directPayment', 'DIRECT', 'INSURANCE']).optional(),
  })
  .transform((data) => {
    const body = {
      serviceId: data.serviceId,
      visitAddress: data.visitAddress || data.address,
      notes: data.notes || data.additionalNotes,
      preferredDate: data.preferredDate || data.date,
      paymentMode: data.paymentMode,
    };
    if (data.bookingType || data.bookingMethod) {
      const method = String(data.bookingType || data.bookingMethod).toLowerCase();
      body.paymentMode = method === 'medicalinsurance' || method === 'insurance' ? 'INSURANCE' : 'DIRECT';
    }
    return body;
  })
  .refine((data) => data.visitAddress && data.preferredDate && data.paymentMode, {
    message: 'visitAddress (or address), preferredDate (or date), and paymentMode (or bookingType) are required',
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

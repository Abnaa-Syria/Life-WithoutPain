const { z } = require('zod');

const createAppointmentSchema = z.object({
  doctorId: z.number().int().positive(),
  serviceId: z.number().int().positive().optional(),
  appointmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'appointmentDate must be YYYY-MM-DD'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'startTime must be HH:mm'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'endTime must be HH:mm'),
  bookingFor: z.enum(['personal', 'family']).optional(),
  familyMemberId: z.number().int().positive().optional(),
  paymentMode: z.enum(['DIRECT', 'INSURANCE']).optional(),
  notes: z.string().max(5000).optional(),
}).superRefine((data, ctx) => {
  if (data.bookingFor === 'family' && !data.familyMemberId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'familyMemberId is required when bookingFor is family',
      path: ['familyMemberId'],
    });
  }
});

const listAppointmentQuerySchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'RESCHEDULED', 'NO_SHOW']).optional(),
  date: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
  filter: z.string().optional(),
  type: z.string().optional(),
  doctorId: z.string().optional(),
  patientId: z.string().optional(),
});

module.exports = {
  createAppointmentSchema,
  listAppointmentQuerySchema,
};

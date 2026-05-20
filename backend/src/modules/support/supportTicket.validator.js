const { z } = require('zod');

const SUPPORT_CATEGORIES = ['TECHNICAL', 'APPOINTMENT', 'PAYMENT', 'INSURANCE', 'ACCOUNT', 'OTHER'];
const SUPPORT_STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
const SUPPORT_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

const createTicketSchema = z.object({
  subject: z.string().min(3).max(500),
  description: z.string().min(3).max(10000),
  category: z.enum(SUPPORT_CATEGORIES),
  priority: z.enum(SUPPORT_PRIORITIES).optional(),
});

const ticketMessageSchema = z.object({
  message: z.string().min(1).max(10000),
  content: z.string().min(1).max(10000).optional(),
}).transform((data) => ({
  message: data.message || data.content,
}));

const ticketIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const listTicketsQuerySchema = z.object({
  status: z.enum(SUPPORT_STATUSES).optional(),
  category: z.enum(SUPPORT_CATEGORIES).optional(),
  creatorRole: z.enum(['PATIENT', 'DOCTOR']).optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  sortBy: z.enum(['createdAt', 'lastActivityAt', 'updatedAt', 'status']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  search: z.string().max(200).optional(),
});

const adminUpdateStatusSchema = z.object({
  status: z.enum(SUPPORT_STATUSES),
  resolutionNotes: z.string().max(5000).optional(),
});

const adminAssignSchema = z.object({
  assignedAdminId: z.coerce.number().int().positive(),
});

const updateSupportInfoSchema = z.object({
  supportPhones: z.array(z.string().min(3).max(30)).optional(),
  supportEmail: z.string().email().max(255).optional(),
  whatsappNumber: z.string().max(50).optional().nullable(),
  whatsappLink: z.string().url().max(500).optional().nullable(),
  socialLinks: z.record(z.string()).optional(),
  workingHours: z.record(z.string()).optional(),
  descriptionAr: z.string().max(10000).optional().nullable(),
  descriptionEn: z.string().max(10000).optional().nullable(),
});

module.exports = {
  SUPPORT_CATEGORIES,
  SUPPORT_STATUSES,
  SUPPORT_PRIORITIES,
  createTicketSchema,
  ticketMessageSchema,
  ticketIdParamSchema,
  listTicketsQuerySchema,
  adminUpdateStatusSchema,
  adminAssignSchema,
  updateSupportInfoSchema,
};

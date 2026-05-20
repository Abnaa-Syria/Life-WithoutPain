const { z } = require('zod');

const idArraySchema = z.array(z.number().int().positive()).optional();

const updateMedicalProfileSchema = z.object({
  chronicDiseaseIds: idArraySchema,
  medicationIds: idArraySchema,
  allergyIds: idArraySchema,
  surgeries: z.string().max(5000).optional().nullable(),
  familyHistory: z.string().max(5000).optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
}).strict();

const attachmentIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const attachmentUploadBodySchema = z.object({
  title: z.string().max(255).optional(),
  titles: z.union([z.string(), z.array(z.string())]).optional(),
}).strict();

const patientIdParamSchema = z.object({
  patientId: z.coerce.number().int().positive(),
});

const patientIdFromIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

module.exports = {
  updateMedicalProfileSchema,
  attachmentIdParamSchema,
  attachmentUploadBodySchema,
  patientIdParamSchema,
  patientIdFromIdParamSchema,
};

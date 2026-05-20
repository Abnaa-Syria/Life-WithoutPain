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
  attachmentId: z.coerce.number().int().positive(),
});

const patientIdParamSchema = z.object({
  patientId: z.coerce.number().int().positive(),
});

const patientIdFromIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

module.exports = {
  updateMedicalProfileSchema,
  attachmentIdParamSchema,
  patientIdParamSchema,
  patientIdFromIdParamSchema,
};

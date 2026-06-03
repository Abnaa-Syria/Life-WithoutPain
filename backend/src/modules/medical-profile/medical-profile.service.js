/**
 * Medical profile catalog/text updates and report attachments.
 * Attachment CRUD is isolated here for a future migration to a unified MedicalFile model.
 */
const prisma = require('../../config/database');
const { NotFoundError, BadRequestError } = require('../../shared/errors/AppError');
const { mapMedicalProfile, mapMedicalProfileAttachment } = require('../../shared/utils/patientAppMappers');
const { enrichMedicalProfile } = require('../../i18n/enrichRelations');
const { getLocale } = require('../../i18n/localeContext');
const { deleteStoredFile } = require('./medical-profile.storage');

const MEDICAL_PROFILE_INCLUDE = {
  chronicDiseases: { where: { isActive: true }, orderBy: { id: 'asc' } },
  medications: { where: { isActive: true }, orderBy: { id: 'asc' } },
  allergies: { where: { isActive: true }, orderBy: { id: 'asc' } },
  attachments: { orderBy: { createdAt: 'desc' } },
};

const LEGACY_FIELDS = ['chronicDiseases', 'currentMedications', 'allergies'];

function rejectLegacyFields(data) {
  const found = LEGACY_FIELDS.filter((f) => data[f] !== undefined);
  if (found.length) {
    throw new BadRequestError(
      `Legacy fields are no longer supported: ${found.join(', ')}. Use chronicDiseaseIds, medicationIds, and allergyIds instead.`,
    );
  }
}

async function validateCatalogIds(ids, model, label) {
  if (!ids || ids.length === 0) return;
  const uniqueIds = [...new Set(ids)];
  const count = await prisma[model].count({
    where: { id: { in: uniqueIds }, isActive: true },
  });
  if (count !== uniqueIds.length) {
    throw new BadRequestError('CATALOG_IDS_INVALID', { label });
  }
}

function buildRelationUpdate(data) {
  const update = {};
  if (data.chronicDiseaseIds !== undefined) {
    update.chronicDiseases = { set: data.chronicDiseaseIds.map((id) => ({ id })) };
  }
  if (data.medicationIds !== undefined) {
    update.medications = { set: data.medicationIds.map((id) => ({ id })) };
  }
  if (data.allergyIds !== undefined) {
    update.allergies = { set: data.allergyIds.map((id) => ({ id })) };
  }
  if (data.surgeries !== undefined) update.surgeries = data.surgeries;
  if (data.familyHistory !== undefined) update.familyHistory = data.familyHistory;
  if (data.notes !== undefined) update.notes = data.notes;
  return update;
}

function mapAttachmentRows(attachments) {
  return attachments.map(mapMedicalProfileAttachment);
}

async function mapLocalizedMedicalProfile(profilePromise, locale) {
  const profile = await profilePromise;
  const resolvedLocale = locale || getLocale();
  return mapMedicalProfile(await enrichMedicalProfile(profile, resolvedLocale));
}

class MedicalProfileService {
  static async ensureMedicalProfile(patientId) {
    let profile = await prisma.medicalProfile.findUnique({
      where: { patientId },
      include: MEDICAL_PROFILE_INCLUDE,
    });
    if (!profile) {
      profile = await prisma.medicalProfile.create({
        data: { patientId },
        include: MEDICAL_PROFILE_INCLUDE,
      });
    }
    return profile;
  }

  static async getByUserId(userId) {
    const patient = await prisma.patientProfile.findUnique({ where: { userId } });
    if (!patient) throw new NotFoundError('PATIENT_PROFILE_NOT_FOUND');
    return mapLocalizedMedicalProfile(this.ensureMedicalProfile(patient.id));
  }

  static async getByPatientId(patientId) {
    const patient = await prisma.patientProfile.findUnique({ where: { id: patientId } });
    if (!patient) throw new NotFoundError('PATIENT_NOT_FOUND');
    return mapLocalizedMedicalProfile(this.ensureMedicalProfile(patientId));
  }

  static async updateByUserId(userId, data) {
    rejectLegacyFields(data);
    const patient = await prisma.patientProfile.findUnique({ where: { userId } });
    if (!patient) throw new NotFoundError('PATIENT_PROFILE_NOT_FOUND');
    return this.updateByPatientId(patient.id, data);
  }

  static async updateByPatientId(patientId, data) {
    rejectLegacyFields(data);

    await Promise.all([
      validateCatalogIds(data.chronicDiseaseIds, 'chronicDisease', 'chronic disease'),
      validateCatalogIds(data.medicationIds, 'medication', 'medication'),
      validateCatalogIds(data.allergyIds, 'allergy', 'allergy'),
    ]);

    const relationUpdate = buildRelationUpdate(data);

    await prisma.medicalProfile.upsert({
      where: { patientId },
      update: relationUpdate,
      create: { patientId, ...relationUpdate },
    });

    return mapLocalizedMedicalProfile(this.ensureMedicalProfile(patientId));
  }

  static async listAttachmentsByUserId(userId) {
    const patient = await prisma.patientProfile.findUnique({ where: { userId } });
    if (!patient) throw new NotFoundError('PATIENT_PROFILE_NOT_FOUND');
    return this.listAttachmentsByPatientId(patient.id);
  }

  static async listAttachmentsByPatientId(patientId) {
    const profile = await this.ensureMedicalProfile(patientId);
    const attachments = await prisma.medicalProfileAttachment.findMany({
      where: { medicalProfileId: profile.id },
      orderBy: { createdAt: 'desc' },
    });
    return mapAttachmentRows(attachments);
  }

  static async addAttachmentsByUserId(userId, files, titles = []) {
    const patient = await prisma.patientProfile.findUnique({ where: { userId } });
    if (!patient) throw new NotFoundError('PATIENT_PROFILE_NOT_FOUND');
    return this.addAttachmentsByPatientId(patient.id, files, titles);
  }

  static async addAttachmentsByPatientId(patientId, files, titles = []) {
    if (!files?.length) throw new BadRequestError('FILES_REQUIRED');

    const profile = await this.ensureMedicalProfile(patientId);

    const created = await prisma.$transaction(
      files.map((file, index) =>
        prisma.medicalProfileAttachment.create({
          data: {
            medicalProfileId: profile.id,
            fileUrl: `/uploads/${file.filename}`,
            mimeType: file.mimetype,
            title: titles[index] || file.originalname || `Attachment ${index + 1}`,
          },
        }),
      ),
    );

    return mapAttachmentRows(created);
  }

  static async deleteAttachmentByUserId(userId, attachmentId) {
    const patient = await prisma.patientProfile.findUnique({ where: { userId } });
    if (!patient) throw new NotFoundError('PATIENT_PROFILE_NOT_FOUND');
    return this.deleteAttachmentByPatientId(patient.id, attachmentId);
  }

  static async addCatalogItemByUserId(userId, field, catalogId) {
    const patient = await prisma.patientProfile.findUnique({ where: { userId } });
    if (!patient) throw new NotFoundError('PATIENT_PROFILE_NOT_FOUND');
    return this.addCatalogItemByPatientId(patient.id, field, catalogId);
  }

  static async addCatalogItemByPatientId(patientId, field, catalogId) {
    const profile = await this.ensureMedicalProfile(patientId);
    const id = parseInt(catalogId, 10);
    const modelMap = {
      chronicDiseases: { model: 'chronicDisease', connect: 'chronicDiseases' },
      medications: { model: 'medication', connect: 'medications' },
    };
    const config = modelMap[field];
    if (!config) throw new BadRequestError('INVALID_CATALOG_FIELD');

    await validateCatalogIds([id], config.model, field.slice(0, -1));

    const existing = profile[config.connect] || [];
    if (existing.some((item) => item.id === id)) {
      return mapLocalizedMedicalProfile(this.ensureMedicalProfile(patientId));
    }

    await prisma.medicalProfile.update({
      where: { id: profile.id },
      data: { [config.connect]: { connect: { id } } },
    });
    return mapLocalizedMedicalProfile(this.ensureMedicalProfile(patientId));
  }

  static async removeCatalogItemByUserId(userId, field, catalogId) {
    const patient = await prisma.patientProfile.findUnique({ where: { userId } });
    if (!patient) throw new NotFoundError('PATIENT_PROFILE_NOT_FOUND');
    return this.removeCatalogItemByPatientId(patient.id, field, catalogId);
  }

  static async removeCatalogItemByPatientId(patientId, field, catalogId) {
    const profile = await this.ensureMedicalProfile(patientId);
    const id = parseInt(catalogId, 10);
    const connectMap = { chronicDiseases: 'chronicDiseases', medications: 'medications' };
    const connect = connectMap[field];
    if (!connect) throw new BadRequestError('INVALID_CATALOG_FIELD');

    await prisma.medicalProfile.update({
      where: { id: profile.id },
      data: { [connect]: { disconnect: { id } } },
    });
    return mapLocalizedMedicalProfile(this.ensureMedicalProfile(patientId));
  }

  static async deleteAttachmentByPatientId(patientId, attachmentId) {
    const profile = await prisma.medicalProfile.findUnique({ where: { patientId } });
    if (!profile) throw new NotFoundError('MEDICAL_PROFILE_NOT_FOUND');

    const attachment = await prisma.medicalProfileAttachment.findFirst({
      where: { id: attachmentId, medicalProfileId: profile.id },
    });
    if (!attachment) throw new NotFoundError('ATTACHMENT_NOT_FOUND');

    await deleteStoredFile(attachment.fileUrl);
    await prisma.medicalProfileAttachment.delete({ where: { id: attachmentId } });
    return { id: attachmentId };
  }
}

module.exports = MedicalProfileService;

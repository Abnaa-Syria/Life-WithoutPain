const prisma = require('../../config/database');
const { NotFoundError, BadRequestError } = require('../../shared/errors/AppError');
const { buildPagination } = require('../../utils/pagination');
const TranslationRepository = require('../../i18n/TranslationRepository');
const { attachTranslations, mapEntityForAdmin, normalizeTranslationsInput } = require('../../i18n/mapLocalized');
const { getLocale } = require('../../i18n/localeContext');
const { stripLegacyTranslationFields } = require('../../i18n/catalogHelpers');

const ENTITY_TYPE = 'sub_speciality';
const FIELDS = ['name', 'description'];

function parseSpecialityIds(query) {
  const ids = [];
  if (query.specializationId) ids.push(parseInt(query.specializationId, 10));
  if (query.specialityId) ids.push(parseInt(query.specialityId, 10));
  if (query.specializationIds) {
    query.specializationIds.split(',').forEach((s) => {
      const n = parseInt(s.trim(), 10);
      if (!Number.isNaN(n)) ids.push(n);
    });
  }
  if (query.specialityIds) {
    query.specialityIds.split(',').forEach((s) => {
      const n = parseInt(s.trim(), 10);
      if (!Number.isNaN(n)) ids.push(n);
    });
  }
  return [...new Set(ids.filter((id) => id > 0))];
}

class SubSpecialityService {
  static async listBySpecialityIds(query, options = {}) {
    const specialityIds = parseSpecialityIds(query);
    const { page, limit, skip } = buildPagination(query);
    const where = { isActive: options.includeInactive ? undefined : true };
    if (specialityIds.length) where.specialityId = { in: specialityIds };

    const locale = options.locale || getLocale() || 'en';
    const [data, total] = await Promise.all([
      prisma.subSpeciality.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ specialityId: 'asc' }, { sortOrder: 'asc' }],
      }),
      prisma.subSpeciality.count({ where }),
    ]);
    const mapped = await attachTranslations(data, ENTITY_TYPE, FIELDS, locale, { admin: options.admin });
    return { data: mapped, total, page, limit };
  }

  static async listForSpeciality(specialityId, query = {}, options = {}) {
    return this.listBySpecialityIds({ specializationId: specialityId, ...query }, options);
  }

  static async listForAdmin(specialityId, query = {}) {
    return this.listForSpeciality(specialityId, query, { admin: true, includeInactive: true });
  }

  static async getByIdForAdmin(specialityId, id) {
    const item = await prisma.subSpeciality.findFirst({
      where: { id: parseInt(id, 10), specialityId: parseInt(specialityId, 10) },
    });
    if (!item) throw new NotFoundError('SUB_SPECIALITY_NOT_FOUND');
    const map = await TranslationRepository.loadForEntities(ENTITY_TYPE, [item.id]);
    return mapEntityForAdmin(item, map, FIELDS);
  }

  static async createForAdmin(specialityId, data) {
    const parent = await prisma.speciality.findUnique({ where: { id: parseInt(specialityId, 10) } });
    if (!parent) throw new NotFoundError('SPECIALITY_NOT_FOUND');
    const translations = normalizeTranslationsInput(data);
    const created = await prisma.subSpeciality.create({
      data: {
        specialityId: parent.id,
        isActive: data.isActive ?? true,
        sortOrder: data.sortOrder ?? 0,
        ...stripLegacyTranslationFields(data),
      },
    });
    if (translations) await TranslationRepository.upsertSet(ENTITY_TYPE, created.id, translations);
    const map = await TranslationRepository.loadForEntities(ENTITY_TYPE, [created.id]);
    return mapEntityForAdmin(created, map, FIELDS);
  }

  static async updateForAdmin(specialityId, id, data) {
    await this.getByIdForAdmin(specialityId, id);
    const translations = normalizeTranslationsInput(data);
    const updated = await prisma.subSpeciality.update({
      where: { id: parseInt(id, 10) },
      data: {
        isActive: data.isActive,
        sortOrder: data.sortOrder,
        ...stripLegacyTranslationFields(data),
      },
    });
    if (translations) await TranslationRepository.upsertSet(ENTITY_TYPE, updated.id, translations);
    const map = await TranslationRepository.loadForEntities(ENTITY_TYPE, [updated.id]);
    return mapEntityForAdmin(updated, map, FIELDS);
  }

  static async deleteForAdmin(specialityId, id) {
    await this.getByIdForAdmin(specialityId, id);
    await prisma.subSpeciality.delete({ where: { id: parseInt(id, 10) } });
    await TranslationRepository.deleteForEntity(ENTITY_TYPE, parseInt(id, 10));
    return { id: parseInt(id, 10) };
  }

  static async validateForDoctorRegistration(specialityId, subSpecializationIds) {
    if (!subSpecializationIds?.length) return [];
    if (!specialityId) {
      throw new BadRequestError('SPECIALIZATION_ID_REQUIRED');
    }
    const parentId = parseInt(specialityId, 10);
    const uniqueIds = [...new Set(subSpecializationIds.map((id) => parseInt(id, 10)))];
    const subs = await prisma.subSpeciality.findMany({
      where: { id: { in: uniqueIds }, specialityId: parentId, isActive: true },
    });
    if (subs.length !== uniqueIds.length) {
      throw new BadRequestError('SUB_SPECIALIZATION_IDS_INVALID');
    }
    return uniqueIds;
  }

  static async connectToDoctor(doctorProfileId, subSpecializationIds) {
    if (!subSpecializationIds?.length) return;
    await prisma.doctorProfile.update({
      where: { id: doctorProfileId },
      data: {
        subSpecialities: { connect: subSpecializationIds.map((id) => ({ id })) },
      },
    });
  }
}

module.exports = SubSpecialityService;

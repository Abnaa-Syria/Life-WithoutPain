const SpecialityRepository = require('./speciality.repository');
const { NotFoundError } = require('../../shared/errors/AppError');
const { buildPagination } = require('../../utils/pagination');
const { mapSpecializationWithSubs } = require('../../shared/utils/patientAppMappers');
const TranslationRepository = require('../../i18n/TranslationRepository');
const { attachTranslations, mapEntityForAdmin, normalizeTranslationsInput } = require('../../i18n/mapLocalized');
const { getLocale } = require('../../i18n/localeContext');
const { stripLegacyTranslationFields } = require('../../i18n/catalogHelpers');

const ENTITY_TYPE = 'speciality';
const FIELDS = ['name', 'description'];

const SPECIALITY_INCLUDE_SUBS = {
  subSpecialities: {
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  },
};

class SpecialityService {
  static async list(query, options = {}) {
    const { page, limit, skip } = buildPagination(query);
    const where = {};
    if (query.search) {
      const ids = await TranslationRepository.findEntityIdsBySearch(ENTITY_TYPE, query.search, ['name']);
      where.id = ids?.length ? { in: ids } : -1;
    }
    if (query.isActive !== undefined) where.isActive = query.isActive === 'true';
    else if (options.activeOnly) where.isActive = true;

    const locale = options.locale || getLocale() || 'en';

    const [data, total] = await Promise.all([
      SpecialityRepository.findMany({
        where,
        skip,
        take: limit,
        orderBy: { sortOrder: 'asc' },
        include: {
          _count: { select: { doctors: true, subSpecialities: true } },
          ...(options.includeSubs ? SPECIALITY_INCLUDE_SUBS : {}),
        },
      }),
      SpecialityRepository.count({ where }),
    ]);

    if (options.admin) {
      const mapped = await attachTranslations(data, ENTITY_TYPE, FIELDS, locale, { admin: true });
      return { data: mapped, total, page, limit };
    }

    const mapped = await attachTranslations(data, ENTITY_TYPE, FIELDS, locale);
    if (options.includeSubs) {
      const subIds = data.flatMap((s) => (s.subSpecialities || []).map((sub) => sub.id));
      const subTranslations = await TranslationRepository.loadForEntities('sub_speciality', subIds);
      const result = data.map((raw, i) =>
        mapSpecializationWithSubs(
          { ...raw, ...mapped[i] },
          locale,
          subTranslations,
        ),
      );
      return { data: result, total, page, limit };
    }

    return { data: mapped, total, page, limit };
  }

  static async getById(id, options = {}) {
    const data = await SpecialityRepository.findUnique({
      where: { id: parseInt(id) },
      include: options.includeSubs ? SPECIALITY_INCLUDE_SUBS : undefined,
    });
    if (!data) throw new NotFoundError('SPECIALITY_NOT_FOUND');
    const locale = options.locale || getLocale() || 'en';
    if (options.admin) {
      const [mapped] = await attachTranslations([data], ENTITY_TYPE, FIELDS, locale, { admin: true });
      return mapped;
    }
    const [localized] = await attachTranslations([data], ENTITY_TYPE, FIELDS, locale);
    if (!options.includeSubs) return localized;
    const subIds = (data.subSpecialities || []).map((s) => s.id);
    const subTranslations = await TranslationRepository.loadForEntities('sub_speciality', subIds);
    return mapSpecializationWithSubs({ ...data, ...localized }, locale, subTranslations);
  }

  static async create(data) {
    const translations = normalizeTranslationsInput(data);
    const created = await SpecialityRepository.create({ data: stripLegacyTranslationFields(data) });
    if (translations) await TranslationRepository.upsertSet(ENTITY_TYPE, created.id, translations);
    const map = await TranslationRepository.loadForEntities(ENTITY_TYPE, [created.id]);
    return mapEntityForAdmin(created, map, FIELDS);
  }

  static async update(id, data) {
    const translations = normalizeTranslationsInput(data);
    const updated = await SpecialityRepository.update({
      where: { id: parseInt(id) },
      data: stripLegacyTranslationFields(data),
    });
    if (translations) await TranslationRepository.upsertSet(ENTITY_TYPE, updated.id, translations);
    const map = await TranslationRepository.loadForEntities(ENTITY_TYPE, [updated.id]);
    return mapEntityForAdmin(updated, map, FIELDS);
  }

  static async delete(id) {
    const deleted = await SpecialityRepository.delete({ where: { id: parseInt(id) } });
    await TranslationRepository.deleteForEntity(ENTITY_TYPE, parseInt(id));
    return deleted;
  }
}

module.exports = SpecialityService;

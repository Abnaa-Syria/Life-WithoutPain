const ServiceRepository = require('./service.repository');
const { NotFoundError } = require('../../shared/errors/AppError');
const { buildPagination } = require('../../utils/pagination');
const TranslationRepository = require('../../i18n/TranslationRepository');
const { attachTranslations, mapEntityForAdmin, normalizeTranslationsInput } = require('../../i18n/mapLocalized');
const { getLocale } = require('../../i18n/localeContext');
const { stripLegacyTranslationFields } = require('../../i18n/catalogHelpers');

const ENTITY_TYPE = 'service';
const FIELDS = ['name', 'description'];

class ServiceService {
  static async list(query, options = {}) {
    const { page, limit, skip } = buildPagination(query);
    const where = {};
    if (query.search) {
      const ids = await TranslationRepository.findEntityIdsBySearch(ENTITY_TYPE, query.search, ['name']);
      where.id = ids?.length ? { in: ids } : -1;
    }
    if (query.type) where.type = query.type;
    if (query.isActive !== undefined) where.isActive = query.isActive === 'true';

    const locale = options.locale || getLocale() || 'en';
    const [data, total] = await Promise.all([
      ServiceRepository.findMany({ where, skip, take: limit, orderBy: { sortOrder: 'asc' } }),
      ServiceRepository.count({ where }),
    ]);
    const mapped = await attachTranslations(data, ENTITY_TYPE, FIELDS, locale, { admin: options.admin });
    return { data: mapped, total, page, limit };
  }

  static async getById(id, options = {}) {
    const data = await ServiceRepository.findUnique({ where: { id: parseInt(id) } });
    if (!data) throw new NotFoundError('SERVICE_NOT_FOUND');
    const locale = options.locale || getLocale() || 'en';
    const [mapped] = await attachTranslations([data], ENTITY_TYPE, FIELDS, locale, { admin: options.admin });
    return mapped;
  }

  static async create(data) {
    const translations = normalizeTranslationsInput(data);
    const created = await ServiceRepository.create({ data: stripLegacyTranslationFields(data) });
    if (translations) await TranslationRepository.upsertSet(ENTITY_TYPE, created.id, translations);
    const map = await TranslationRepository.loadForEntities(ENTITY_TYPE, [created.id]);
    return mapEntityForAdmin(created, map, FIELDS);
  }

  static async update(id, data) {
    const translations = normalizeTranslationsInput(data);
    const updated = await ServiceRepository.update({
      where: { id: parseInt(id) },
      data: stripLegacyTranslationFields(data),
    });
    if (translations) await TranslationRepository.upsertSet(ENTITY_TYPE, updated.id, translations);
    const map = await TranslationRepository.loadForEntities(ENTITY_TYPE, [updated.id]);
    return mapEntityForAdmin(updated, map, FIELDS);
  }

  static async delete(id) {
    const deleted = await ServiceRepository.delete({ where: { id: parseInt(id) } });
    await TranslationRepository.deleteForEntity(ENTITY_TYPE, parseInt(id));
    return deleted;
  }
}

module.exports = ServiceService;

const TranslationRepository = require('./TranslationRepository');
const { normalizeTranslationsInput, mapEntityForAdmin, attachTranslations } = require('./mapLocalized');
const { getLocale } = require('./localeContext');

function stripLegacyTranslationFields(data) {
  const {
    nameAr,
    nameEn,
    descriptionAr,
    descriptionEn,
    titleAr,
    titleEn,
    bodyAr,
    bodyEn,
    categoryAr,
    categoryEn,
    bio,
    bioAr,
    translations,
    ...rest
  } = data;
  return rest;
}

async function createWithTranslations(prismaDelegate, entityType, data, fields) {
  const translations = normalizeTranslationsInput(data);
  const clean = stripLegacyTranslationFields(data);
  const created = await prismaDelegate.create({ data: clean });
  if (translations) {
    await TranslationRepository.upsertSet(entityType, created.id, translations);
  }
  const map = await TranslationRepository.loadForEntities(entityType, [created.id]);
  return mapEntityForAdmin(created, map, fields);
}

async function updateWithTranslations(prismaDelegate, entityType, id, data, fields) {
  const translations = normalizeTranslationsInput(data);
  const clean = stripLegacyTranslationFields(data);
  const updated = await prismaDelegate.update({ where: { id: parseInt(id, 10) }, data: clean });
  if (translations) {
    await TranslationRepository.upsertSet(entityType, updated.id, translations);
  }
  const map = await TranslationRepository.loadForEntities(entityType, [updated.id]);
  return mapEntityForAdmin(updated, map, fields);
}

async function listWithTranslations(prismaDelegate, entityType, fields, { where, skip, take, orderBy, locale, admin }) {
  const resolvedLocale = locale || getLocale() || 'en';
  const [data, total] = await Promise.all([
    prismaDelegate.findMany({ where, skip, take, orderBy }),
    prismaDelegate.count({ where }),
  ]);
  const mapped = await attachTranslations(data, entityType, fields, resolvedLocale, { admin });
  return { data: mapped, total };
}

async function applySearchFilter(entityType, search, where) {
  if (!search?.trim()) return where;
  const ids = await TranslationRepository.findEntityIdsBySearch(entityType, search, ['name']);
  return { ...where, id: ids?.length ? { in: ids } : -1 };
}

module.exports = {
  stripLegacyTranslationFields,
  createWithTranslations,
  updateWithTranslations,
  listWithTranslations,
  applySearchFilter,
};

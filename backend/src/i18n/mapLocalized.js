const { DEFAULT_LOCALE } = require('./config');
const TranslationRepository = require('./TranslationRepository');

function pickLocalized(translations, locale, fieldKey, fallbackLocale = DEFAULT_LOCALE) {
  if (!translations) return null;
  const loc = translations[locale] || translations[fallbackLocale] || {};
  return loc[fieldKey] ?? translations[fallbackLocale]?.[fieldKey] ?? translations.en?.[fieldKey] ?? null;
}

function mapEntityForApi(entity, translationMap, locale, fields = ['name', 'description']) {
  if (!entity) return null;
  const id = entity.id;
  const translations = translationMap?.get?.(id) || translationMap?.[id] || {};
  const result = { ...entity };
  delete result.nameAr;
  delete result.nameEn;
  delete result.descriptionAr;
  delete result.descriptionEn;
  delete result.titleAr;
  delete result.titleEn;
  delete result.bodyAr;
  delete result.bodyEn;
  delete result.categoryAr;
  delete result.categoryEn;
  delete result.bioAr;

  for (const field of fields) {
    result[field] = pickLocalized(translations, locale, field);
  }
  return result;
}

function mapEntityForAdmin(entity, translationMap, fields = ['name', 'description']) {
  if (!entity) return null;
  const id = entity.id;
  const translations = translationMap?.get?.(id) || translationMap?.[id] || { en: {}, ar: {} };
  const { nameAr, nameEn, descriptionAr, descriptionEn, titleAr, titleEn, bodyAr, bodyEn, categoryAr, categoryEn, bioAr, bio, ...rest } = entity;
  return {
    ...rest,
    translations,
  };
}

async function attachTranslations(entities, entityType, fields, locale, { admin = false } = {}) {
  if (!entities) return entities;
  const list = Array.isArray(entities) ? entities : [entities];
  const ids = list.map((e) => e.id).filter(Boolean);
  const map = await TranslationRepository.loadForEntities(entityType, ids);
  const mapper = admin
    ? (e) => mapEntityForAdmin(e, map, fields)
    : (e) => mapEntityForApi(e, map, locale, fields);
  const mapped = list.map(mapper);
  return Array.isArray(entities) ? mapped : mapped[0];
}

function normalizeTranslationsInput(body) {
  if (body.translations) return body.translations;
  const translations = { en: {}, ar: {} };
  const pairs = [
    ['name', 'nameEn', 'nameAr'],
    ['description', 'descriptionEn', 'descriptionAr'],
    ['title', 'titleEn', 'titleAr'],
    ['body', 'bodyEn', 'bodyAr'],
    ['category', 'categoryEn', 'categoryAr'],
    ['bio', 'bio', 'bioAr'],
  ];
  for (const [key, enCol, arCol] of pairs) {
    if (body[enCol] != null) translations.en[key] = body[enCol];
    if (body[arCol] != null) translations.ar[key] = body[arCol];
  }
  if (Object.keys(translations.en).length || Object.keys(translations.ar).length) {
    return translations;
  }
  return null;
}

async function createWithTranslations(prismaDelegate, entityType, data, fields) {
  const translations = normalizeTranslationsInput(data);
  const clean = stripLegacyFields(data);
  const created = await prismaDelegate.create({ data: clean });
  if (translations) await TranslationRepository.upsertSet(entityType, created.id, translations);
  const map = await TranslationRepository.loadForEntities(entityType, [created.id]);
  return mapEntityForAdmin(created, map, fields);
}

async function updateWithTranslations(prismaDelegate, entityType, id, data, fields) {
  const translations = normalizeTranslationsInput(data);
  const clean = stripLegacyFields(data);
  const updated = await prismaDelegate.update({ where: { id: parseInt(id, 10) }, data: clean });
  if (translations) await TranslationRepository.upsertSet(entityType, updated.id, translations);
  const map = await TranslationRepository.loadForEntities(entityType, [updated.id]);
  return mapEntityForAdmin(updated, map, fields);
}

function stripLegacyFields(data) {
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

module.exports = {
  pickLocalized,
  mapEntityForApi,
  mapEntityForAdmin,
  attachTranslations,
  normalizeTranslationsInput,
  createWithTranslations,
  updateWithTranslations,
  stripLegacyFields,
};

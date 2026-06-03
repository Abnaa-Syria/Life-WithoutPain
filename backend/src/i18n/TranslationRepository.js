const prisma = require('../config/database');
const { DEFAULT_LOCALE } = require('./config');

class TranslationRepository {
  static async loadForEntities(entityType, entityIds, locales = null) {
    if (!entityIds?.length) return new Map();
    const rows = await prisma.entityTranslation.findMany({
      where: {
        entityType,
        entityId: { in: entityIds },
        ...(locales ? { locale: { in: locales } } : {}),
      },
    });
    const map = new Map();
    for (const row of rows) {
      if (!map.has(row.entityId)) map.set(row.entityId, {});
      const bucket = map.get(row.entityId);
      if (!bucket[row.locale]) bucket[row.locale] = {};
      bucket[row.locale][row.fieldKey] = row.value;
    }
    return map;
  }

  static async upsertSet(entityType, entityId, translationsByLocale) {
    const ops = [];
    for (const [locale, fields] of Object.entries(translationsByLocale)) {
      for (const [fieldKey, value] of Object.entries(fields)) {
        if (value == null || value === '') continue;
        ops.push(
          prisma.entityTranslation.upsert({
            where: {
              entityType_entityId_locale_fieldKey: {
                entityType,
                entityId,
                locale,
                fieldKey,
              },
            },
            create: { entityType, entityId, locale, fieldKey, value: String(value) },
            update: { value: String(value) },
          }),
        );
      }
    }
    if (ops.length) await prisma.$transaction(ops);
  }

  static async deleteForEntity(entityType, entityId) {
    await prisma.entityTranslation.deleteMany({ where: { entityType, entityId } });
  }

  static async findEntityIdsBySearch(entityType, search, fieldKeys = ['name']) {
    if (!search?.trim()) return null;
    const rows = await prisma.entityTranslation.findMany({
      where: {
        entityType,
        fieldKey: { in: fieldKeys },
        value: { contains: search },
      },
      select: { entityId: true },
      distinct: ['entityId'],
    });
    return rows.map((r) => r.entityId);
  }

  static translationsFromLegacyRow(row, fieldPairs) {
    const translations = { en: {}, ar: {} };
    for (const { key, arCol, enCol } of fieldPairs) {
      if (row[arCol] != null) translations.ar[key] = row[arCol];
      if (row[enCol] != null) translations.en[key] = row[enCol];
    }
    if (row.description && !translations.en.description) {
      translations.en.description = row.description;
      translations.ar.description = row.description;
    }
    return translations;
  }
}

module.exports = TranslationRepository;

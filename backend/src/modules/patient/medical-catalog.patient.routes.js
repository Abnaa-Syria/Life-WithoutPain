const router = require('express').Router();
const prisma = require('../../config/database');
const { paginatedResponse } = require('../../shared/responses');
const { asyncHandler } = require('../../utils/helpers');
const { buildPagination } = require('../../utils/pagination');
const { mapCatalogItem } = require('../../shared/utils/patientAppMappers');
const TranslationRepository = require('../../i18n/TranslationRepository');
const { attachTranslations } = require('../../i18n/mapLocalized');

const MODEL_ENTITY = {
  chronicDisease: { entityType: 'chronic_disease', fields: ['name', 'description'] },
  medication: { entityType: 'medication', fields: ['name', 'description'] },
  allergy: { entityType: 'allergy', fields: ['name', 'description'] },
  medicalTest: { entityType: 'medical_test', fields: ['name', 'description', 'category'] },
};

async function listCatalog(model, query, locale) {
  const meta = MODEL_ENTITY[model];
  const { page, limit, skip } = buildPagination(query);
  const where = { isActive: true };
  if (query.search) {
    const ids = await TranslationRepository.findEntityIdsBySearch(meta.entityType, query.search, ['name']);
    where.id = ids?.length ? { in: ids } : -1;
  }
  const [data, total] = await Promise.all([
    prisma[model].findMany({ where, skip, take: limit, orderBy: { id: 'asc' } }),
    prisma[model].count({ where }),
  ]);
  const localized = await attachTranslations(data, meta.entityType, meta.fields, locale);
  return { data: localized.map(mapCatalogItem), total, page, limit };
}

router.get('/chronic-diseases', asyncHandler(async (req, res) => {
  const { data, total, page, limit } = await listCatalog('chronicDisease', req.query, req.locale);
  return paginatedResponse(res, { data, total, page, limit });
}));

router.get('/medications', asyncHandler(async (req, res) => {
  const { data, total, page, limit } = await listCatalog('medication', req.query, req.locale);
  return paginatedResponse(res, { data, total, page, limit });
}));

router.get('/allergies', asyncHandler(async (req, res) => {
  const { data, total, page, limit } = await listCatalog('allergy', req.query, req.locale);
  return paginatedResponse(res, { data, total, page, limit });
}));

router.get('/medical-tests', asyncHandler(async (req, res) => {
  const { data, total, page, limit } = await listCatalog('medicalTest', req.query, req.locale);
  return paginatedResponse(res, { data, total, page, limit });
}));

module.exports = router;

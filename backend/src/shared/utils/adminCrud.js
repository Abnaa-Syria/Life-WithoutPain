const { asyncHandler } = require('../../utils/helpers');
const { successResponse, createdResponse, paginatedResponse } = require('../../shared/responses');
const { buildPagination } = require('../../utils/pagination');
const prisma = require('../../config/database');
const { NotFoundError } = require('../../shared/errors/AppError');
const { createAuditLog } = require('../../middlewares/auditLog');
const TranslationRepository = require('../../i18n/TranslationRepository');
const {
  createWithTranslations,
  updateWithTranslations,
  attachTranslations,
  normalizeTranslationsInput,
  stripLegacyFields,
} = require('../../i18n/mapLocalized');
const { getLocale } = require('../../i18n/localeContext');

const MODEL_TO_ENTITY = {
  service: { entityType: 'service', fields: ['name', 'description'] },
  insuranceProvider: { entityType: 'insurance_provider', fields: ['name'] },
  chronicDisease: { entityType: 'chronic_disease', fields: ['name', 'description'] },
  allergy: { entityType: 'allergy', fields: ['name', 'description'] },
  medication: { entityType: 'medication', fields: ['name', 'description'] },
  medicalTest: { entityType: 'medical_test', fields: ['name', 'description', 'category'] },
};

function crud(model, {
  searchFields = [],
  translationEntityType = null,
  translatableFields = null,
  include,
  defaultOrder = { createdAt: 'desc' },
  filterFn,
  entityLabel = model,
} = {}) {
  const translationMeta = translationEntityType
    ? { entityType: translationEntityType, fields: translatableFields || MODEL_TO_ENTITY[model]?.fields || ['name'] }
    : MODEL_TO_ENTITY[model] || null;

  const list = asyncHandler(async (req, res) => {
    const { page, limit, skip } = buildPagination(req.query);
    let where = {};
    if (req.query.search) {
      if (translationMeta) {
        const ids = await TranslationRepository.findEntityIdsBySearch(
          translationMeta.entityType,
          req.query.search,
          translationMeta.fields.filter((f) => f !== 'description' && f !== 'category').length
            ? translationMeta.fields.filter((f) => ['name', 'category'].includes(f))
            : ['name'],
        );
        where.id = ids?.length ? { in: ids } : -1;
      } else if (searchFields.length) {
        where.OR = searchFields.map((f) => {
          if (f.includes('.')) {
            const [rel, field] = f.split('.');
            return { [rel]: { [field]: { contains: req.query.search } } };
          }
          return { [f]: { contains: req.query.search } };
        });
      }
    }
    if (filterFn) where = { ...where, ...filterFn(req.query) };
    const [data, total] = await Promise.all([
      prisma[model].findMany({ where, skip, take: limit, orderBy: defaultOrder, ...(include ? { include } : {}) }),
      prisma[model].count({ where }),
    ]);
    let mapped = data;
    if (translationMeta) {
      mapped = await attachTranslations(data, translationMeta.entityType, translationMeta.fields, req.locale, {
        admin: true,
      });
    }
    return paginatedResponse(res, { data: mapped, total, page, limit });
  });

  const getOne = asyncHandler(async (req, res) => {
    const data = await prisma[model].findUnique({
      where: { id: parseInt(req.params.id) },
      ...(include ? { include } : {}),
    });
    if (!data) throw new NotFoundError('ENTITY_NOT_FOUND', { entityLabel });
    if (translationMeta) {
      const [mapped] = await attachTranslations([data], translationMeta.entityType, translationMeta.fields, req.locale, {
        admin: true,
      });
      return successResponse(res, { data: mapped });
    }
    return successResponse(res, { data });
  });

  const create = asyncHandler(async (req, res) => {
    let data;
    if (translationMeta && normalizeTranslationsInput(req.body)) {
      data = await createWithTranslations(prisma[model], translationMeta.entityType, req.body, translationMeta.fields);
    } else if (translationMeta) {
      data = await prisma[model].create({ data: stripLegacyFields(req.body) });
    } else {
      data = await prisma[model].create({ data: req.body });
    }
    createAuditLog({ actorId: req.user.id, entityType: entityLabel, entityId: data.id, action: 'CREATE', newValues: req.body, req });
    return createdResponse(res, { data });
  });

  const update = asyncHandler(async (req, res) => {
    let data;
    if (translationMeta && normalizeTranslationsInput(req.body)) {
      data = await updateWithTranslations(prisma[model], translationMeta.entityType, req.params.id, req.body, translationMeta.fields);
    } else if (translationMeta) {
      data = await prisma[model].update({
        where: { id: parseInt(req.params.id) },
        data: stripLegacyFields(req.body),
      });
    } else {
      data = await prisma[model].update({ where: { id: parseInt(req.params.id) }, data: req.body });
    }
    createAuditLog({ actorId: req.user.id, entityType: entityLabel, entityId: data.id, action: 'UPDATE', newValues: req.body, req });
    return successResponse(res, { data });
  });

  const remove = asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    await prisma[model].delete({ where: { id } });
    if (translationMeta) await TranslationRepository.deleteForEntity(translationMeta.entityType, id);
    createAuditLog({ actorId: req.user.id, entityType: entityLabel, entityId: id, action: 'DELETE', req });
    return successResponse(res, { data: null, messageKey: 'SUCCESS' });
  });

  return { list, getOne, create, update, remove };
}

module.exports = { crud };

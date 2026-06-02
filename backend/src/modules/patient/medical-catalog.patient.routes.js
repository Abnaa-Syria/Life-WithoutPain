const router = require('express').Router();
const prisma = require('../../config/database');
const { successResponse, paginatedResponse } = require('../../shared/responses');
const { asyncHandler } = require('../../utils/helpers');
const { buildPagination } = require('../../utils/pagination');
const { mapCatalogItem } = require('../../shared/utils/patientAppMappers');

async function listCatalog(model, query) {
  const { page, limit, skip } = buildPagination(query);
  const where = { isActive: true };
  if (query.search) {
    where.OR = [
      { nameAr: { contains: query.search } },
      { nameEn: { contains: query.search } },
    ];
  }
  const [data, total] = await Promise.all([
    prisma[model].findMany({ where, skip, take: limit, orderBy: { nameEn: 'asc' } }),
    prisma[model].count({ where }),
  ]);
  return { data: data.map(mapCatalogItem), total, page, limit };
}

router.get('/chronic-diseases', asyncHandler(async (req, res) => {
  const { data, total, page, limit } = await listCatalog('chronicDisease', req.query);
  return paginatedResponse(res, { data, total, page, limit });
}));

router.get('/medications', asyncHandler(async (req, res) => {
  const { data, total, page, limit } = await listCatalog('medication', req.query);
  return paginatedResponse(res, { data, total, page, limit });
}));

module.exports = router;

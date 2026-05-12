const { asyncHandler } = require('../../utils/helpers');
const { successResponse, createdResponse, paginatedResponse } = require('../../shared/responses');
const { buildPagination } = require('../../utils/pagination');
const prisma = require('../../config/database');
const { NotFoundError } = require('../../shared/errors/AppError');
const { createAuditLog } = require('../../middlewares/auditLog');

/**
 * Generic CRUD factory for admin routes
 */
function crud(model, { searchFields = [], include, defaultOrder = { createdAt: 'desc' }, filterFn, entityLabel = model } = {}) {
  const list = asyncHandler(async (req, res) => {
    const { page, limit, skip } = buildPagination(req.query);
    let where = {};
    if (req.query.search && searchFields.length) {
      where.OR = searchFields.map((f) => {
        if (f.includes('.')) {
          const [rel, field] = f.split('.');
          return { [rel]: { [field]: { contains: req.query.search } } };
        }
        return { [f]: { contains: req.query.search } };
      });
    }
    if (filterFn) where = { ...where, ...filterFn(req.query) };
    const [data, total] = await Promise.all([
      prisma[model].findMany({ where, skip, take: limit, orderBy: defaultOrder, ...(include ? { include } : {}) }),
      prisma[model].count({ where }),
    ]);
    return paginatedResponse(res, { data, total, page, limit });
  });

  const getOne = asyncHandler(async (req, res) => {
    const data = await prisma[model].findUnique({ where: { id: parseInt(req.params.id) }, ...(include ? { include } : {}) });
    if (!data) throw new NotFoundError(`${entityLabel} not found`);
    return successResponse(res, { data });
  });

  const create = asyncHandler(async (req, res) => {
    const data = await prisma[model].create({ data: req.body });
    createAuditLog({ actorId: req.user.id, entityType: entityLabel, entityId: data.id, action: 'CREATE', newValues: req.body, req });
    return createdResponse(res, { data });
  });

  const update = asyncHandler(async (req, res) => {
    const data = await prisma[model].update({ where: { id: parseInt(req.params.id) }, data: req.body });
    createAuditLog({ actorId: req.user.id, entityType: entityLabel, entityId: data.id, action: 'UPDATE', newValues: req.body, req });
    return successResponse(res, { data });
  });

  const remove = asyncHandler(async (req, res) => {
    await prisma[model].delete({ where: { id: parseInt(req.params.id) } });
    createAuditLog({ actorId: req.user.id, entityType: entityLabel, entityId: parseInt(req.params.id), action: 'DELETE', req });
    return successResponse(res, { data: null, message: `${entityLabel} deleted` });
  });

  return { list, getOne, create, update, remove };
}

module.exports = { crud };

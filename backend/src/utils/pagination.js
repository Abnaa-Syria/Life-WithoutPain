const { PAGINATION } = require('../constants');

const buildPagination = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || PAGINATION.DEFAULT_PAGE);
  const limit = Math.min(
    PAGINATION.MAX_LIMIT,
    Math.max(1, parseInt(query.limit, 10) || PAGINATION.DEFAULT_LIMIT)
  );
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

const buildSorting = (query, allowedFields = ['createdAt']) => {
  const sortBy = allowedFields.includes(query.sortBy) ? query.sortBy : 'createdAt';
  const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';

  return { [sortBy]: sortOrder };
};

const buildSearchFilter = (search, fields) => {
  if (!search || !fields.length) return {};
  return {
    OR: fields.map((field) => ({
      [field]: { contains: search },
    })),
  };
};

module.exports = { buildPagination, buildSorting, buildSearchFilter };

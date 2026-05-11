const successResponse = (res, { data = null, message = 'Success', meta = null, statusCode = 200 }) => {
  const response = {
    success: true,
    message,
    data,
  };
  if (meta) response.meta = meta;
  return res.status(statusCode).json(response);
};

const createdResponse = (res, { data = null, message = 'Created successfully' }) => {
  return successResponse(res, { data, message, statusCode: 201 });
};

const paginatedResponse = (res, { data, total, page, limit, message = 'Data fetched successfully' }) => {
  const totalPages = Math.ceil(total / limit);
  return successResponse(res, {
    data,
    message,
    meta: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  });
};

const noContentResponse = (res) => {
  return res.status(204).send();
};

module.exports = {
  successResponse,
  createdResponse,
  paginatedResponse,
  noContentResponse,
};

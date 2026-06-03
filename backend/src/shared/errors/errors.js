const {
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  TooManyRequestsError,
  InternalError,
} = require('./AppError');

const Errors = {
  badRequest: (code, params) => new BadRequestError(code, params),
  unauthorized: (code, params) => new UnauthorizedError(code, params),
  forbidden: (code, params) => new ForbiddenError(code, params),
  notFound: (code, params) => new NotFoundError(code, params),
  conflict: (code, params) => new ConflictError(code, params),
  validation: (code, errors, params) => new ValidationError(code, errors, params),
  tooManyRequests: (code, params) => new TooManyRequestsError(code, params),
  internal: (code, params) => new InternalError(code, params),
};

module.exports = Errors;

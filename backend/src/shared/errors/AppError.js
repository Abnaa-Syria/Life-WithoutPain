const { getStatusForCode } = require('../../i18n/errorCodes');

class AppError extends Error {
  constructor(errorCode, params = {}, options = {}) {
    super(errorCode);
    this.errorCode = errorCode;
    this.params = params;
    this.statusCode = options.statusCode ?? getStatusForCode(errorCode);
    this.isOperational = true;
    this.errors = options.errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

class BadRequestError extends AppError {
  constructor(errorCode = 'BAD_REQUEST', params = {}) {
    super(errorCode, params);
  }
}

class UnauthorizedError extends AppError {
  constructor(errorCode = 'UNAUTHORIZED', params = {}) {
    super(errorCode, params);
  }
}

class ForbiddenError extends AppError {
  constructor(errorCode = 'FORBIDDEN', params = {}) {
    super(errorCode, params);
  }
}

class NotFoundError extends AppError {
  constructor(errorCode = 'NOT_FOUND', params = {}) {
    super(errorCode, params);
  }
}

class ConflictError extends AppError {
  constructor(errorCode = 'CONFLICT', params = {}) {
    super(errorCode, params);
  }
}

class ValidationError extends AppError {
  constructor(errorCode = 'VALIDATION_ERROR', errors = [], params = {}) {
    super(errorCode, params, { errors, statusCode: 422 });
    this.errors = errors;
  }
}

class TooManyRequestsError extends AppError {
  constructor(errorCode = 'RATE_LIMITED', params = {}) {
    super(errorCode, params, { statusCode: 429 });
  }
}

class InternalError extends AppError {
  constructor(errorCode = 'INTERNAL_ERROR', params = {}) {
    super(errorCode, params, { statusCode: 500 });
  }
}

module.exports = {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  TooManyRequestsError,
  InternalError,
};

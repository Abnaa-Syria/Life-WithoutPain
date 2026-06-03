const logger = require('../config/logger');
const { AppError, ValidationError } = require('../shared/errors/AppError');
const { translateError, translateValidation } = require('../i18n');
const { getLocale } = require('../i18n/localeContext');

function resolveRequestLocale(req) {
  return req?.locale || getLocale() || 'en';
}

function translateFieldErrors(errors, locale) {
  if (!errors?.length) return errors;
  return errors.map((err) => ({
    field: err.field,
    message: translateValidation(err.messageKey || 'REQUIRED', err.params || {}, locale),
    messageKey: err.messageKey,
  }));
}

const errorHandler = (err, req, res, _next) => {
  const locale = resolveRequestLocale(req);

  logger.error({
    msg: err.errorCode || err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
  });

  if (err instanceof ValidationError) {
    return res.status(err.statusCode).json({
      success: false,
      message: translateError(err.errorCode, err.params, locale),
      errorCode: err.errorCode,
      errors: translateFieldErrors(err.errors, locale),
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: translateError(err.errorCode, err.params, locale),
      errorCode: err.errorCode,
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: translateError('INVALID_TOKEN', {}, locale),
      errorCode: 'INVALID_TOKEN',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: translateError('TOKEN_EXPIRED', {}, locale),
      errorCode: 'TOKEN_EXPIRED',
    });
  }

  if (err.code === 'P2002') {
    return res.status(409).json({
      success: false,
      message: translateError('DUPLICATE_ENTRY', {}, locale),
      errorCode: 'DUPLICATE_ENTRY',
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: translateError('NOT_FOUND', {}, locale),
      errorCode: 'NOT_FOUND',
    });
  }

  const statusCode = err.statusCode || 500;

  return res.status(statusCode).json({
    success: false,
    message: translateError('INTERNAL_ERROR', {}, locale),
    errorCode: 'INTERNAL_ERROR',
  });
};

module.exports = errorHandler;

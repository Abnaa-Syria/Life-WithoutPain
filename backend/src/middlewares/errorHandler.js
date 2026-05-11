const logger = require('../config/logger');
const { AppError, ValidationError } = require('../shared/errors/AppError');

const errorHandler = (err, req, res, _next) => {
  logger.error({
    msg: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
  });

  if (err instanceof ValidationError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errorCode: err.errorCode,
      errors: err.errors,
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errorCode: err.errorCode,
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
      errorCode: 'INVALID_TOKEN',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired',
      errorCode: 'TOKEN_EXPIRED',
    });
  }

  if (err.code === 'P2002') {
    return res.status(409).json({
      success: false,
      message: 'A record with this data already exists',
      errorCode: 'DUPLICATE_ENTRY',
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Record not found',
      errorCode: 'NOT_FOUND',
    });
  }

  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? 'Internal server error' : err.message;

  return res.status(statusCode).json({
    success: false,
    message,
    errorCode: 'INTERNAL_ERROR',
  });
};

module.exports = errorHandler;

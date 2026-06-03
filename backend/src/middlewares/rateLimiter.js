const rateLimit = require('express-rate-limit');
const config = require('../config');

const isProduction = config.env === 'production';

/** No-op in non-production so local/TestSprite runs are not throttled. */
function devPassthrough(req, res, next) {
  next();
}

function createLimiter(options) {
  if (!isProduction) return devPassthrough;
  return rateLimit(options);
}

const globalLimiter = createLimiter({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    success: false,
    message: 'Too many requests, please try again later',
    errorCode: 'RATE_LIMITED',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later',
    errorCode: 'AUTH_RATE_LIMITED',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const otpLimiter = createLimiter({
  windowMs: 5 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: 'Too many OTP requests, please try again later',
    errorCode: 'OTP_RATE_LIMITED',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { globalLimiter, authLimiter, otpLimiter, isProduction };

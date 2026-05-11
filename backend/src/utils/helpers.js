const crypto = require('crypto');

const generateOTP = (length = 6) => {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  return otp;
};

const generateRefreshToken = () => {
  return crypto.randomBytes(64).toString('hex');
};

const excludeFields = (obj, fields) => {
  const result = { ...obj };
  fields.forEach((field) => delete result[field]);
  return result;
};

const pickFields = (obj, fields) => {
  const result = {};
  fields.forEach((field) => {
    if (obj[field] !== undefined) result[field] = obj[field];
  });
  return result;
};

const buildDateRange = (startDate, endDate) => {
  const filter = {};
  if (startDate) filter.gte = new Date(startDate);
  if (endDate) filter.lte = new Date(endDate);
  return Object.keys(filter).length ? filter : undefined;
};

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  generateOTP,
  generateRefreshToken,
  excludeFields,
  pickFields,
  buildDateRange,
  asyncHandler,
};

const { translateSuccess } = require('../../i18n');
const { getLocale } = require('../../i18n/localeContext');

function resolveLocale(res) {
  return res?.req?.locale || getLocale() || 'en';
}

function resolveMessage({ message, messageKey, messageParams }, locale) {
  if (messageKey) {
    return translateSuccess(messageKey, messageParams || {}, locale);
  }
  if (message) {
    return message;
  }
  return translateSuccess('SUCCESS', {}, locale);
}

const successResponse = (res, { data = null, message = null, messageKey = 'SUCCESS', messageParams = null, meta = null, statusCode = 200 } = {}) => {
  const locale = resolveLocale(res);
  const response = {
    success: true,
    message: resolveMessage({ message, messageKey, messageParams }, locale),
    data,
  };
  if (meta) response.meta = meta;
  return res.status(statusCode).json(response);
};

const createdResponse = (res, options = {}) => {
  return successResponse(res, {
    ...options,
    messageKey: options.messageKey || 'CREATED',
    statusCode: 201,
  });
};

const paginatedResponse = (res, { data, total, page, limit, messageKey = 'DATA_FETCHED', message = null, messageParams = null }) => {
  const totalPages = Math.ceil(total / limit);
  return successResponse(res, {
    data,
    message,
    messageKey,
    messageParams,
    meta: { total, page, limit, totalPages },
  });
};

module.exports = { successResponse, createdResponse, paginatedResponse };

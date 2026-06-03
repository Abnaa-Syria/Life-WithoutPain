const path = require('path');
const i18next = require('i18next');
const { DEFAULT_LOCALE, SUPPORTED_LOCALES } = require('./config');
const { getLocale } = require('./localeContext');

let initialized = false;

async function initI18n() {
  if (initialized) return i18next;

  const localesDir = path.join(__dirname, 'locales');

  await i18next.init({
    lng: DEFAULT_LOCALE,
    fallbackLng: DEFAULT_LOCALE,
    supportedLngs: SUPPORTED_LOCALES,
    ns: ['errors', 'validation', 'success'],
    defaultNS: 'errors',
    returnEmptyString: false,
    interpolation: { escapeValue: false },
    resources: {
      en: {
        errors: require('./locales/en/errors.json'),
        validation: require('./locales/en/validation.json'),
        success: require('./locales/en/success.json'),
      },
      ar: {
        errors: require('./locales/ar/errors.json'),
        validation: require('./locales/ar/validation.json'),
        success: require('./locales/ar/success.json'),
      },
    },
  });

  initialized = true;
  return i18next;
}

function t(key, options = {}) {
  const lng = options.lng || getLocale() || DEFAULT_LOCALE;
  const { lng: _lng, ...rest } = options;
  const result = i18next.t(key, { lng, ...rest });
  if (result === key && lng !== DEFAULT_LOCALE) {
    return i18next.t(key, { lng: DEFAULT_LOCALE, ...rest });
  }
  return result;
}

function translateError(errorCode, params = {}, locale) {
  return t(`errors:${errorCode}`, { lng: locale, defaultValue: t(`errors:${errorCode}`, { lng: DEFAULT_LOCALE }), ...params });
}

function translateValidation(messageKey, params = {}, locale) {
  return t(`validation:${messageKey}`, { lng: locale, defaultValue: t(`validation:${messageKey}`, { lng: DEFAULT_LOCALE }), ...params });
}

function translateSuccess(messageKey, params = {}, locale) {
  return t(`success:${messageKey}`, { lng: locale, defaultValue: t(`success:${messageKey}`, { lng: DEFAULT_LOCALE }), ...params });
}

module.exports = {
  initI18n,
  t,
  translateError,
  translateValidation,
  translateSuccess,
  i18next,
};

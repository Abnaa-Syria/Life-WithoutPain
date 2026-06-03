const Negotiator = require('negotiator');
const { SUPPORTED_LOCALES, DEFAULT_LOCALE } = require('./config');

function parseAcceptLanguage(header) {
  if (!header || typeof header !== 'string') {
    return null;
  }
  const negotiator = new Negotiator({ headers: { 'accept-language': header } });
  const preferred = negotiator.languages();
  for (const lang of preferred) {
    const base = lang.split('-')[0].toLowerCase();
    if (SUPPORTED_LOCALES.includes(base)) {
      return base;
    }
  }
  return null;
}

/**
 * Priority: user DB preference → Accept-Language → default (en).
 */
function resolveLocale({ preferredLanguage, acceptLanguageHeader }) {
  if (preferredLanguage && SUPPORTED_LOCALES.includes(preferredLanguage)) {
    return preferredLanguage;
  }
  const fromHeader = parseAcceptLanguage(acceptLanguageHeader);
  if (fromHeader) {
    return fromHeader;
  }
  return DEFAULT_LOCALE;
}

module.exports = {
  parseAcceptLanguage,
  resolveLocale,
};

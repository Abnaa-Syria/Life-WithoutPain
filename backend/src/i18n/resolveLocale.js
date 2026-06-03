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
 * Priority: Accept-Language header → user DB preferredLanguage → default (en).
 * Per-request header wins so clients (and Swagger) can negotiate language; DB preference
 * applies when the header is missing or unsupported.
 */
function resolveLocale({ preferredLanguage, acceptLanguageHeader }) {
  const fromHeader = parseAcceptLanguage(acceptLanguageHeader);
  if (fromHeader) {
    return fromHeader;
  }
  if (preferredLanguage && SUPPORTED_LOCALES.includes(preferredLanguage)) {
    return preferredLanguage;
  }
  return DEFAULT_LOCALE;
}

module.exports = {
  parseAcceptLanguage,
  resolveLocale,
};

const { parseAcceptLanguage, resolveLocale } = require('../i18n/resolveLocale');
const { localeStorage, setRequestLocale } = require('../i18n/localeContext');

function parseAcceptLanguageMiddleware(req, res, next) {
  req.acceptLanguageHeader = req.get('Accept-Language') || null;
  req.negotiatedLocale = parseAcceptLanguage(req.acceptLanguageHeader);
  next();
}

function bindLocaleMiddleware(req, res, next) {
  const locale = resolveLocale({
    preferredLanguage: req.user?.preferredLanguage,
    acceptLanguageHeader: req.acceptLanguageHeader,
  });
  req.locale = locale;
  setRequestLocale(locale);
  next();
}

function localeMiddleware(req, res, next) {
  localeStorage.run({ locale: req.locale || req.negotiatedLocale }, () => next());
}

function withLocaleContext(handler) {
  return (req, res, next) => {
    const locale = resolveLocale({
      preferredLanguage: req.user?.preferredLanguage,
      acceptLanguageHeader: req.acceptLanguageHeader,
    });
    req.locale = locale;
    localeStorage.run({ locale }, () => handler(req, res, next));
  };
}

module.exports = {
  parseAcceptLanguageMiddleware,
  bindLocaleMiddleware,
  localeMiddleware,
  withLocaleContext,
};

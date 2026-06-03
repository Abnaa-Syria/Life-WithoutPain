const { AsyncLocalStorage } = require('async_hooks');

const localeStorage = new AsyncLocalStorage();

function runWithLocale(locale, fn) {
  return localeStorage.run({ locale }, fn);
}

function setRequestLocale(locale) {
  const store = localeStorage.getStore();
  if (store) {
    store.locale = locale;
  }
}

function getLocale() {
  const store = localeStorage.getStore();
  return store?.locale || null;
}

module.exports = {
  localeStorage,
  runWithLocale,
  setRequestLocale,
  getLocale,
};

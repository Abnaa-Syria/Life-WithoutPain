const assert = require('assert');
const { resolveLocale, parseAcceptLanguage } = require('../../src/i18n/resolveLocale');
const { initI18n, translateError, translateSuccess } = require('../../src/i18n');
const { pickLocalized } = require('../../src/i18n/mapLocalized');
const { localeStorage } = require('../../src/i18n/localeContext');

async function run() {
  assert.strictEqual(resolveLocale({ preferredLanguage: 'ar', acceptLanguageHeader: 'en' }), 'ar');
  assert.strictEqual(resolveLocale({ preferredLanguage: null, acceptLanguageHeader: 'ar-SA,ar;q=0.9' }), 'ar');
  assert.strictEqual(resolveLocale({ preferredLanguage: null, acceptLanguageHeader: null }), 'en');
  assert.strictEqual(parseAcceptLanguage('fr-FR,fr;q=0.9'), null);

  await initI18n();

  assert.ok(translateError('INVALID_CREDENTIALS', {}, 'en').includes('credential') || translateError('INVALID_CREDENTIALS', {}, 'en').length > 0);
  assert.ok(translateError('INVALID_CREDENTIALS', {}, 'ar').length > 0);
  assert.strictEqual(translateError('NONEXISTENT_CODE_XYZ', {}, 'ar'), translateError('NONEXISTENT_CODE_XYZ', {}, 'en'));

  assert.ok(translateSuccess('LOGIN_SUCCESS', {}, 'ar').length > 0);

  const translations = {
    en: { name: 'Cardiology' },
    ar: { name: 'قلب' },
  };
  assert.strictEqual(pickLocalized(translations, 'ar', 'name'), 'قلب');
  assert.strictEqual(pickLocalized(translations, 'fr', 'name'), 'Cardiology');

  localeStorage.run({ locale: 'ar' }, () => {
    const { getLocale } = require('../../src/i18n/localeContext');
    assert.strictEqual(getLocale(), 'ar');
  });

  console.log('i18n locale tests passed');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

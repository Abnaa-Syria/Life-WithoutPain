const prisma = require('../../config/database');
const { mapSupportInfo } = require('./support.mapper');
const TranslationRepository = require('../../i18n/TranslationRepository');
const { normalizeTranslationsInput, mapEntityForAdmin } = require('../../i18n/mapLocalized');

const ENTITY_TYPE = 'support_contact_info';

const DEFAULT_CONTACT = {
  id: 1,
  supportPhones: ['+966500000000'],
  supportEmail: 'support@hayabilaalam.com',
  whatsappNumber: '+966500000000',
  whatsappLink: 'https://wa.me/966500000000',
  socialLinks: {},
  workingHours: { ar: 'الأحد - الخميس: 9:00 - 17:00', en: 'Sun - Thu: 9:00 AM - 5:00 PM' },
};

const DEFAULT_TRANSLATIONS = {
  ar: { description: 'فريق الدعم متاح لمساعدتك.' },
  en: { description: 'Our support team is here to help.' },
};

class SupportInfoService {
  static async getRecord() {
    let info = await prisma.supportContactInfo.findUnique({ where: { id: 1 } });
    if (!info) {
      info = await prisma.supportContactInfo.create({ data: { id: 1, ...DEFAULT_CONTACT } });
      await TranslationRepository.upsertSet(ENTITY_TYPE, 1, DEFAULT_TRANSLATIONS);
    }
    const map = await TranslationRepository.loadForEntities(ENTITY_TYPE, [1]);
    return { ...info, translations: map.get(1) || DEFAULT_TRANSLATIONS };
  }

  static async getPublicInfo(lang = 'ar') {
    const info = await this.getRecord();
    return mapSupportInfo(info, lang);
  }

  static async getAdminInfo() {
    const info = await this.getRecord();
    const map = await TranslationRepository.loadForEntities(ENTITY_TYPE, [info.id]);
    return mapEntityForAdmin(info, map, ['description']);
  }

  static async updateAdminInfo(body, updatedBy) {
    const translations = normalizeTranslationsInput(body);
    const { descriptionAr, descriptionEn, translations: _t, ...rest } = body;
    const data = { ...rest, updatedBy, updatedAt: new Date() };
    const info = await prisma.supportContactInfo.upsert({
      where: { id: 1 },
      update: data,
      create: { id: 1, ...DEFAULT_CONTACT, ...data },
    });
    if (translations) {
      await TranslationRepository.upsertSet(ENTITY_TYPE, 1, translations);
    }
    const map = await TranslationRepository.loadForEntities(ENTITY_TYPE, [1]);
    return mapEntityForAdmin(info, map, ['description']);
  }
}

module.exports = SupportInfoService;

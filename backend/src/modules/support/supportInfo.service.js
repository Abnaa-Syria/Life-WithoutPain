const prisma = require('../../config/database');
const { mapSupportInfo } = require('./support.mapper');

const DEFAULT_CONTACT = {
  id: 1,
  supportPhones: ['+966500000000'],
  supportEmail: 'support@hayabilaalam.com',
  whatsappNumber: '+966500000000',
  whatsappLink: 'https://wa.me/966500000000',
  socialLinks: {},
  workingHours: { ar: 'الأحد - الخميس: 9:00 - 17:00', en: 'Sun - Thu: 9:00 AM - 5:00 PM' },
  descriptionAr: 'فريق الدعم متاح لمساعدتك.',
  descriptionEn: 'Our support team is here to help.',
};

class SupportInfoService {
  static async getRecord() {
    let info = await prisma.supportContactInfo.findUnique({ where: { id: 1 } });
    if (!info) {
      info = await prisma.supportContactInfo.create({ data: { id: 1, ...DEFAULT_CONTACT } });
    }
    return info;
  }

  static async getPublicInfo(lang = 'ar') {
    const info = await this.getRecord();
    return mapSupportInfo(info, lang);
  }

  static async getAdminInfo() {
    return this.getRecord();
  }

  static async updateAdminInfo(body, updatedBy) {
    const data = { ...body, updatedBy, updatedAt: new Date() };
    return prisma.supportContactInfo.upsert({
      where: { id: 1 },
      update: data,
      create: { id: 1, ...DEFAULT_CONTACT, ...data },
    });
  }
}

module.exports = SupportInfoService;

const prisma = require('../../config/database');
const { NotFoundError, BadRequestError } = require('../../shared/errors/AppError');
const { buildPagination, buildSorting, buildSearchFilter } = require('../../utils/pagination');
const { enrichInsuranceProvidersOnRecords, enrichAppointments } = require('../../i18n/enrichRelations');

class PatientService {
  static async getProfile(userId) {
    const profile = await prisma.patientProfile.findUnique({
      where: { userId },
      include: {
        user: { select: { id: true, fullName: true, email: true, phone: true, avatarUrl: true, preferredLanguage: true, darkModeEnabled: true } },
        medicalProfile: true,
      },
    });
    if (!profile) throw new NotFoundError('PATIENT_PROFILE_NOT_FOUND');
    return profile;
  }

  static async updateProfile(userId, data) {
    const profile = await prisma.patientProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundError('PATIENT_PROFILE_NOT_FOUND');

    return prisma.patientProfile.update({
      where: { userId },
      data,
      include: { user: { select: { id: true, fullName: true, email: true, phone: true } } },
    });
  }

  static async getMedicalProfile(userId) {
    const MedicalProfileService = require('../medical-profile/medical-profile.service');
    return MedicalProfileService.getByUserId(userId);
  }

  static async updateMedicalProfile(userId, data) {
    const MedicalProfileService = require('../medical-profile/medical-profile.service');
    return MedicalProfileService.updateByUserId(userId, data);
  }

  static async listMedicalProfileAttachments(userId) {
    const MedicalProfileService = require('../medical-profile/medical-profile.service');
    return MedicalProfileService.listAttachmentsByUserId(userId);
  }

  static async addMedicalProfileAttachments(userId, files, titles = []) {
    const MedicalProfileService = require('../medical-profile/medical-profile.service');
    return MedicalProfileService.addAttachmentsByUserId(userId, files, titles);
  }

  static async deleteMedicalProfileAttachment(userId, attachmentId) {
    const MedicalProfileService = require('../medical-profile/medical-profile.service');
    return MedicalProfileService.deleteAttachmentByUserId(userId, attachmentId);
  }

  static buildFamilyMemberPayload(body) {
    const fullName = body.fullName || body.name;
    const relationType = body.relationType || body.relation || body.relationship;
    if (!fullName || !relationType) {
      throw new BadRequestError('FAMILY_MEMBER_FIELDS_REQUIRED');
    }

    const payload = {
      fullName: String(fullName).trim(),
      relationType: String(relationType).trim(),
      residenceCardNumber: body.residenceCardNumber || undefined,
      phone: body.phone || undefined,
      notes: body.notes || undefined,
    };

    const dob = body.dateOfBirth || body.birthDate;
    if (dob) payload.dateOfBirth = new Date(dob);

    if (body.gender !== undefined && body.gender !== null && body.gender !== '') {
      const normalized = String(body.gender).trim().toUpperCase();
      if (normalized === 'MALE' || ['M', 'MAN', 'BOY'].includes(normalized)) {
        payload.gender = 'MALE';
      } else if (normalized === 'FEMALE' || ['F', 'WOMAN', 'GIRL'].includes(normalized)) {
        payload.gender = 'FEMALE';
      } else {
        throw new BadRequestError('GENDER_INVALID');
      }
    }

    return payload;
  }

  static async getFamilyMembers(userId) {
    const patient = await prisma.patientProfile.findUnique({ where: { userId } });
    if (!patient) throw new NotFoundError('PATIENT_PROFILE_NOT_FOUND');

    return prisma.familyMember.findMany({ where: { patientId: patient.id }, orderBy: { createdAt: 'desc' } });
  }

  static async createFamilyMember(userId, data) {
    const patient = await prisma.patientProfile.findUnique({ where: { userId } });
    if (!patient) throw new NotFoundError('PATIENT_PROFILE_NOT_FOUND');

    return prisma.familyMember.create({ data: { patientId: patient.id, ...data } });
  }

  static async updateFamilyMember(userId, memberId, data) {
    const patient = await prisma.patientProfile.findUnique({ where: { userId } });
    if (!patient) throw new NotFoundError('PATIENT_PROFILE_NOT_FOUND');

    const member = await prisma.familyMember.findFirst({ where: { id: memberId, patientId: patient.id } });
    if (!member) throw new NotFoundError('FAMILY_MEMBER_NOT_FOUND');

    return prisma.familyMember.update({ where: { id: memberId }, data });
  }

  static async deleteFamilyMember(userId, memberId) {
    const patient = await prisma.patientProfile.findUnique({ where: { userId } });
    if (!patient) throw new NotFoundError('PATIENT_PROFILE_NOT_FOUND');

    const member = await prisma.familyMember.findFirst({ where: { id: memberId, patientId: patient.id } });
    if (!member) throw new NotFoundError('FAMILY_MEMBER_NOT_FOUND');

    return prisma.familyMember.delete({ where: { id: memberId } });
  }

  static withLocalizedProviders(insurances, locale) {
    return enrichInsuranceProvidersOnRecords(insurances, locale);
  }

  static async getInsurances(userId, options = {}) {
    const patient = await prisma.patientProfile.findUnique({ where: { userId } });
    if (!patient) throw new NotFoundError('PATIENT_PROFILE_NOT_FOUND');

    const insurances = await prisma.patientInsurance.findMany({
      where: { patientId: patient.id },
      include: { provider: { select: { id: true, code: true, logoUrl: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return PatientService.withLocalizedProviders(insurances, options.locale);
  }

  static async createInsurance(userId, data, options = {}) {
    const patient = await prisma.patientProfile.findUnique({ where: { userId } });
    if (!patient) throw new NotFoundError('PATIENT_PROFILE_NOT_FOUND');

    const insurance = await prisma.patientInsurance.create({
      data: { patientId: patient.id, ...data },
      include: { provider: { select: { id: true, code: true, logoUrl: true } } },
    });

    await prisma.patientProfile.update({ where: { id: patient.id }, data: { insuranceLinked: true } });
    return PatientService.withLocalizedProviders(insurance, options.locale);
  }

  static async updateInsurance(userId, insuranceId, data, options = {}) {
    const patient = await prisma.patientProfile.findUnique({ where: { userId } });
    if (!patient) throw new NotFoundError('PATIENT_PROFILE_NOT_FOUND');

    const insurance = await prisma.patientInsurance.findFirst({ where: { id: insuranceId, patientId: patient.id } });
    if (!insurance) throw new NotFoundError('INSURANCE_NOT_FOUND');

    const updated = await prisma.patientInsurance.update({
      where: { id: insuranceId },
      data,
      include: { provider: { select: { id: true, code: true, logoUrl: true } } },
    });
    return PatientService.withLocalizedProviders(updated, options.locale);
  }

  static async deleteInsurance(userId, insuranceId) {
    const patient = await prisma.patientProfile.findUnique({ where: { userId } });
    if (!patient) throw new NotFoundError('PATIENT_PROFILE_NOT_FOUND');

    const insurance = await prisma.patientInsurance.findFirst({ where: { id: insuranceId, patientId: patient.id } });
    if (!insurance) throw new NotFoundError('INSURANCE_NOT_FOUND');

    await prisma.patientInsurance.delete({ where: { id: insuranceId } });

    const remaining = await prisma.patientInsurance.count({ where: { patientId: patient.id } });
    if (remaining === 0) {
      await prisma.patientProfile.update({ where: { id: patient.id }, data: { insuranceLinked: false } });
    }
  }

  static async getMedicalFiles(userId, query) {
    const patient = await prisma.patientProfile.findUnique({ where: { userId } });
    if (!patient) throw new NotFoundError('PATIENT_PROFILE_NOT_FOUND');

    const { page, limit, skip } = buildPagination(query);
    const where = { patientId: patient.id };
    if (query.category) where.category = query.category;

    const [data, total] = await Promise.all([
      prisma.medicalFile.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.medicalFile.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  static async uploadMedicalFile(userId, fileData) {
    const patient = await prisma.patientProfile.findUnique({ where: { userId } });
    if (!patient) throw new NotFoundError('PATIENT_PROFILE_NOT_FOUND');

    return prisma.medicalFile.create({
      data: { patientId: patient.id, uploadedBy: userId, ...fileData },
    });
  }

  static async getDashboardSummary(userId) {
    const patient = await prisma.patientProfile.findUnique({ where: { userId } });
    if (!patient) throw new NotFoundError('PATIENT_PROFILE_NOT_FOUND');

    const [upcomingCount, completedCount, unreadNotifications, insuranceCount] = await Promise.all([
      prisma.appointment.count({
        where: { patientId: patient.id, status: { in: ['PENDING', 'CONFIRMED'] }, appointmentDate: { gte: new Date() } },
      }),
      prisma.appointment.count({ where: { patientId: patient.id, status: 'COMPLETED' } }),
      prisma.notification.count({ where: { userId, isRead: false } }),
      prisma.patientInsurance.count({ where: { patientId: patient.id } }),
    ]);

    return { upcomingAppointments: upcomingCount, completedAppointments: completedCount, unreadNotifications, linkedInsurances: insuranceCount };
  }

  static async getUpcomingAppointments(userId, query) {
    const patient = await prisma.patientProfile.findUnique({ where: { userId } });
    if (!patient) throw new NotFoundError('PATIENT_PROFILE_NOT_FOUND');

    const { page, limit, skip } = buildPagination(query);
    const where = {
      patientId: patient.id,
      status: { in: ['PENDING', 'CONFIRMED'] },
      appointmentDate: { gte: new Date() },
    };

    const [data, total] = await Promise.all([
      prisma.appointment.findMany({
        where, skip, take: limit, orderBy: { appointmentDate: 'asc' },
        include: {
          doctor: { include: { user: { select: { fullName: true, avatarUrl: true } }, speciality: true } },
          service: true,
        },
      }),
      prisma.appointment.count({ where }),
    ]);

    const enriched = await enrichAppointments(data);
    return { data: enriched, total, page, limit };
  }

  static async getAppointmentHistory(userId, query) {
    const patient = await prisma.patientProfile.findUnique({ where: { userId } });
    if (!patient) throw new NotFoundError('PATIENT_PROFILE_NOT_FOUND');

    const { page, limit, skip } = buildPagination(query);
    const where = { patientId: patient.id };
    if (query.status) where.status = query.status;

    const [data, total] = await Promise.all([
      prisma.appointment.findMany({
        where, skip, take: limit, orderBy: { appointmentDate: 'desc' },
        include: {
          doctor: { include: { user: { select: { fullName: true, avatarUrl: true } }, speciality: true } },
          service: true,
        },
      }),
      prisma.appointment.count({ where }),
    ]);

    const enriched = await enrichAppointments(data);
    return { data: enriched, total, page, limit };
  }

  static async getNotifications(userId, query, locale = 'en') {
    const { page, limit, skip } = buildPagination(query);
    const where = { userId };
    if (query.isRead !== undefined) where.isRead = query.isRead === 'true';

    const [rows, total] = await Promise.all([
      prisma.notification.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.notification.count({ where }),
    ]);

    const NotificationService = require('../../shared/notifications/NotificationService');
    const data = await NotificationService.loadTranslationsForNotifications(rows);

    return { data, total, page, limit };
  }

  static async getSettings(userId) {
    const profile = await prisma.patientProfile.findUnique({
      where: { userId },
      include: {
        user: { select: { preferredLanguage: true, darkModeEnabled: true, fullName: true } },
      },
    });
    if (!profile) throw new NotFoundError('PATIENT_PROFILE_NOT_FOUND');
    return {
      language: profile.user.preferredLanguage,
      darkModeEnabled: profile.user.darkModeEnabled,
      fullName: profile.user.fullName,
      notificationsEnabled: profile.notificationsEnabled,
      privacy: profile.privacySettings || {},
    };
  }

  static async updateSettings(userId, data) {
    const profile = await prisma.patientProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundError('PATIENT_PROFILE_NOT_FOUND');

    const language = data.preferredLanguage ?? data.language;
    if (language !== undefined && !['ar', 'en'].includes(language)) {
      throw new BadRequestError('LANGUAGE_INVALID');
    }

    const userData = {};
    if (language !== undefined) userData.preferredLanguage = language;
    if (data.darkModeEnabled !== undefined) userData.darkModeEnabled = data.darkModeEnabled;
    if (data.fullName !== undefined) userData.fullName = data.fullName;

    if (Object.keys(userData).length) {
      await prisma.user.update({ where: { id: userId }, data: userData });
    }

    if (data.notificationsEnabled !== undefined || data.privacy !== undefined) {
      await prisma.patientProfile.update({
        where: { userId },
        data: {
          notificationsEnabled: data.notificationsEnabled,
          privacySettings: data.privacy,
        },
      });
    }

    return this.getSettings(userId);
  }

  static async listMyPrescriptions(userId, query) {
    const patient = await prisma.patientProfile.findUnique({ where: { userId } });
    if (!patient) throw new NotFoundError('PATIENT_PROFILE_NOT_FOUND');
    const PrescriptionService = require('../prescriptions/prescription.service');
    return PrescriptionService.list({ ...query, patientId: patient.id });
  }

  static async listMyReports(userId, query) {
    const patient = await prisma.patientProfile.findUnique({ where: { userId } });
    if (!patient) throw new NotFoundError('PATIENT_PROFILE_NOT_FOUND');
    const ReportService = require('../reports/report.service');
    return ReportService.list({ ...query, patientId: patient.id });
  }

  static async listMyRadiology(userId, query) {
    return this.getMedicalFiles(userId, { ...query, category: 'RADIOLOGY' });
  }

  static async getMedicalTimeline(userId, query) {
    const patient = await prisma.patientProfile.findUnique({ where: { userId } });
    if (!patient) throw new NotFoundError('PATIENT_PROFILE_NOT_FOUND');

    const { mapTimelineItem } = require('../../shared/utils/patientAppMappers');
    const PrescriptionService = require('../prescriptions/prescription.service');
    const ReportService = require('../reports/report.service');

    const [rx, reports, xrays, labTests] = await Promise.all([
      PrescriptionService.list({ patientId: patient.id, limit: 500, page: 1 }),
      ReportService.list({ patientId: patient.id, limit: 500, page: 1 }),
      this.getMedicalFiles(userId, { category: 'RADIOLOGY', limit: 500, page: 1 }),
      prisma.labTestRequest.findMany({
        where: { patientId: patient.id },
        orderBy: { createdAt: 'desc' },
        take: 500,
      }),
    ]);

    const items = [
      ...rx.data.map((item) => mapTimelineItem('prescription', item)),
      ...reports.data.map((item) => mapTimelineItem('report', item)),
      ...xrays.data.map((item) => mapTimelineItem('xray', { ...item, uploadedFile: item.fileUrl })),
      ...labTests.map((item) => mapTimelineItem('labTest', { ...item, summary: item.notes || item.title })),
    ];

    items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const { page, limit, skip } = buildPagination(query);
    const total = items.length;
    const data = items.slice(skip, skip + limit);
    return { data, total, page, limit };
  }

  static async listDirectories(userId, query) {
    const type = (query.type || 'all').toLowerCase();
    const result = { prescriptions: [], reports: [], xrays: [] };

    if (type === 'all' || type === 'prescriptions') {
      const rx = await this.listMyPrescriptions(userId, query);
      result.prescriptions = rx.data;
    }
    if (type === 'all' || type === 'reports') {
      const reports = await this.listMyReports(userId, query);
      result.reports = reports.data;
    }
    if (type === 'all' || type === 'xrays') {
      const xrays = await this.listMyRadiology(userId, query);
      result.xrays = xrays.data;
    }
    return result;
  }
}

module.exports = PatientService;

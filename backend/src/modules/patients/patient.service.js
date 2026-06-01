const prisma = require('../../config/database');
const { NotFoundError } = require('../../shared/errors/AppError');
const { buildPagination, buildSorting, buildSearchFilter } = require('../../utils/pagination');

class PatientService {
  static async getProfile(userId) {
    const profile = await prisma.patientProfile.findUnique({
      where: { userId },
      include: {
        user: { select: { id: true, fullName: true, email: true, phone: true, avatarUrl: true, preferredLanguage: true, darkModeEnabled: true } },
        medicalProfile: true,
      },
    });
    if (!profile) throw new NotFoundError('Patient profile not found');
    return profile;
  }

  static async updateProfile(userId, data) {
    const profile = await prisma.patientProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundError('Patient profile not found');

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

  static async getFamilyMembers(userId) {
    const patient = await prisma.patientProfile.findUnique({ where: { userId } });
    if (!patient) throw new NotFoundError('Patient profile not found');

    return prisma.familyMember.findMany({ where: { patientId: patient.id }, orderBy: { createdAt: 'desc' } });
  }

  static async createFamilyMember(userId, data) {
    const patient = await prisma.patientProfile.findUnique({ where: { userId } });
    if (!patient) throw new NotFoundError('Patient profile not found');

    return prisma.familyMember.create({ data: { patientId: patient.id, ...data } });
  }

  static async updateFamilyMember(userId, memberId, data) {
    const patient = await prisma.patientProfile.findUnique({ where: { userId } });
    if (!patient) throw new NotFoundError('Patient profile not found');

    const member = await prisma.familyMember.findFirst({ where: { id: memberId, patientId: patient.id } });
    if (!member) throw new NotFoundError('Family member not found');

    return prisma.familyMember.update({ where: { id: memberId }, data });
  }

  static async deleteFamilyMember(userId, memberId) {
    const patient = await prisma.patientProfile.findUnique({ where: { userId } });
    if (!patient) throw new NotFoundError('Patient profile not found');

    const member = await prisma.familyMember.findFirst({ where: { id: memberId, patientId: patient.id } });
    if (!member) throw new NotFoundError('Family member not found');

    return prisma.familyMember.delete({ where: { id: memberId } });
  }

  static async getInsurances(userId) {
    const patient = await prisma.patientProfile.findUnique({ where: { userId } });
    if (!patient) throw new NotFoundError('Patient profile not found');

    return prisma.patientInsurance.findMany({
      where: { patientId: patient.id },
      include: { provider: { select: { id: true, nameAr: true, nameEn: true, code: true, logoUrl: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async createInsurance(userId, data) {
    const patient = await prisma.patientProfile.findUnique({ where: { userId } });
    if (!patient) throw new NotFoundError('Patient profile not found');

    const insurance = await prisma.patientInsurance.create({
      data: { patientId: patient.id, ...data },
      include: { provider: true },
    });

    await prisma.patientProfile.update({ where: { id: patient.id }, data: { insuranceLinked: true } });
    return insurance;
  }

  static async updateInsurance(userId, insuranceId, data) {
    const patient = await prisma.patientProfile.findUnique({ where: { userId } });
    if (!patient) throw new NotFoundError('Patient profile not found');

    const insurance = await prisma.patientInsurance.findFirst({ where: { id: insuranceId, patientId: patient.id } });
    if (!insurance) throw new NotFoundError('Insurance not found');

    return prisma.patientInsurance.update({ where: { id: insuranceId }, data, include: { provider: true } });
  }

  static async deleteInsurance(userId, insuranceId) {
    const patient = await prisma.patientProfile.findUnique({ where: { userId } });
    if (!patient) throw new NotFoundError('Patient profile not found');

    const insurance = await prisma.patientInsurance.findFirst({ where: { id: insuranceId, patientId: patient.id } });
    if (!insurance) throw new NotFoundError('Insurance not found');

    await prisma.patientInsurance.delete({ where: { id: insuranceId } });

    const remaining = await prisma.patientInsurance.count({ where: { patientId: patient.id } });
    if (remaining === 0) {
      await prisma.patientProfile.update({ where: { id: patient.id }, data: { insuranceLinked: false } });
    }
  }

  static async getMedicalFiles(userId, query) {
    const patient = await prisma.patientProfile.findUnique({ where: { userId } });
    if (!patient) throw new NotFoundError('Patient profile not found');

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
    if (!patient) throw new NotFoundError('Patient profile not found');

    return prisma.medicalFile.create({
      data: { patientId: patient.id, uploadedBy: userId, ...fileData },
    });
  }

  static async getDashboardSummary(userId) {
    const patient = await prisma.patientProfile.findUnique({ where: { userId } });
    if (!patient) throw new NotFoundError('Patient profile not found');

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
    if (!patient) throw new NotFoundError('Patient profile not found');

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

    return { data, total, page, limit };
  }

  static async getAppointmentHistory(userId, query) {
    const patient = await prisma.patientProfile.findUnique({ where: { userId } });
    if (!patient) throw new NotFoundError('Patient profile not found');

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

    return { data, total, page, limit };
  }

  static async getNotifications(userId, query) {
    const { page, limit, skip } = buildPagination(query);
    const where = { userId };
    if (query.isRead !== undefined) where.isRead = query.isRead === 'true';

    const [data, total] = await Promise.all([
      prisma.notification.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.notification.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  static async getSettings(userId) {
    const profile = await prisma.patientProfile.findUnique({
      where: { userId },
      include: {
        user: { select: { preferredLanguage: true, darkModeEnabled: true, fullName: true } },
      },
    });
    if (!profile) throw new NotFoundError('Patient profile not found');
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
    if (!profile) throw new NotFoundError('Patient profile not found');

    if (data.preferredLanguage !== undefined || data.fullName !== undefined || data.darkModeEnabled !== undefined) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          preferredLanguage: data.preferredLanguage,
          darkModeEnabled: data.darkModeEnabled,
          fullName: data.fullName,
        },
      });
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
    if (!patient) throw new NotFoundError('Patient profile not found');
    const PrescriptionService = require('../prescriptions/prescription.service');
    return PrescriptionService.list({ ...query, patientId: patient.id });
  }

  static async listMyReports(userId, query) {
    const patient = await prisma.patientProfile.findUnique({ where: { userId } });
    if (!patient) throw new NotFoundError('Patient profile not found');
    const ReportService = require('../reports/report.service');
    return ReportService.list({ ...query, patientId: patient.id });
  }

  static async listMyRadiology(userId, query) {
    return this.getMedicalFiles(userId, { ...query, category: 'RADIOLOGY' });
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

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
    const patient = await prisma.patientProfile.findUnique({ where: { userId } });
    if (!patient) throw new NotFoundError('Patient profile not found');

    let medicalProfile = await prisma.medicalProfile.findUnique({ where: { patientId: patient.id } });
    if (!medicalProfile) {
      medicalProfile = await prisma.medicalProfile.create({ data: { patientId: patient.id } });
    }
    return medicalProfile;
  }

  static async updateMedicalProfile(userId, data) {
    const patient = await prisma.patientProfile.findUnique({ where: { userId } });
    if (!patient) throw new NotFoundError('Patient profile not found');

    return prisma.medicalProfile.upsert({
      where: { patientId: patient.id },
      update: data,
      create: { patientId: patient.id, ...data },
    });
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

    const [data, total] = await Promise.all([
      prisma.notification.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.notification.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  static async updateSettings(userId, data) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        preferredLanguage: data.preferredLanguage,
        darkModeEnabled: data.darkModeEnabled,
        fullName: data.fullName,
      },
      select: { id: true, fullName: true, preferredLanguage: true, darkModeEnabled: true },
    });
  }
}

module.exports = PatientService;

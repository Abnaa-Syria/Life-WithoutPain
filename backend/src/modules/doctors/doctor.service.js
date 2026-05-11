const prisma = require('../../config/database');
const { NotFoundError, BadRequestError } = require('../../shared/errors/AppError');
const { buildPagination, buildSearchFilter } = require('../../utils/pagination');

class DoctorService {
  static async search(query) {
    const { page, limit, skip } = buildPagination(query);
    const where = {
      verificationStatus: 'APPROVED',
      isPubliclyBookable: true,
      user: { deletedAt: null, status: 'ACTIVE' },
    };

    if (query.specialityId) where.specialityId = parseInt(query.specialityId);
    if (query.city) where.city = { contains: query.city };
    if (query.minFee || query.maxFee) {
      where.consultationFee = {};
      if (query.minFee) where.consultationFee.gte = parseFloat(query.minFee);
      if (query.maxFee) where.consultationFee.lte = parseFloat(query.maxFee);
    }
    if (query.minRating) where.ratingAverage = { gte: parseFloat(query.minRating) };
    if (query.search) {
      where.OR = [
        { user: { fullName: { contains: query.search } } },
        { bio: { contains: query.search } },
        { bioAr: { contains: query.search } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.doctorProfile.findMany({
        where, skip, take: limit,
        orderBy: query.sortBy === 'rating' ? { ratingAverage: 'desc' } : query.sortBy === 'fee' ? { consultationFee: 'asc' } : { createdAt: 'desc' },
        include: {
          user: { select: { id: true, fullName: true, avatarUrl: true } },
          speciality: { select: { id: true, nameAr: true, nameEn: true } },
          doctorServices: { include: { service: { select: { id: true, nameAr: true, nameEn: true, type: true } } } },
        },
      }),
      prisma.doctorProfile.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  static async getById(doctorId) {
    const doctor = await prisma.doctorProfile.findUnique({
      where: { id: parseInt(doctorId) },
      include: {
        user: { select: { id: true, fullName: true, avatarUrl: true } },
        speciality: true,
        doctorServices: { include: { service: true } },
        availability: { where: { isActive: true } },
        reviews: { where: { isVisible: true }, take: 10, orderBy: { createdAt: 'desc' }, include: { patient: { include: { user: { select: { fullName: true } } } } } },
      },
    });
    if (!doctor) throw new NotFoundError('Doctor not found');
    return doctor;
  }

  static async getProfile(userId) {
    const profile = await prisma.doctorProfile.findUnique({
      where: { userId },
      include: {
        user: { select: { id: true, fullName: true, email: true, phone: true, avatarUrl: true, preferredLanguage: true, darkModeEnabled: true } },
        speciality: true,
        doctorServices: { include: { service: true } },
      },
    });
    if (!profile) throw new NotFoundError('Doctor profile not found');
    return profile;
  }

  static async updateProfile(userId, data) {
    const profile = await prisma.doctorProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundError('Doctor profile not found');

    return prisma.doctorProfile.update({ where: { userId }, data, include: { speciality: true } });
  }

  static async uploadVerificationDocument(userId, fileData) {
    const profile = await prisma.doctorProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundError('Doctor profile not found');

    return prisma.doctorVerificationDocument.create({
      data: { doctorId: profile.id, ...fileData },
    });
  }

  static async getVerificationStatus(userId) {
    const profile = await prisma.doctorProfile.findUnique({
      where: { userId },
      select: { verificationStatus: true, isPubliclyBookable: true },
    });
    if (!profile) throw new NotFoundError('Doctor profile not found');

    const documents = await prisma.doctorVerificationDocument.findMany({
      where: { doctorId: (await prisma.doctorProfile.findUnique({ where: { userId } })).id },
      orderBy: { createdAt: 'desc' },
    });

    return { ...profile, documents };
  }

  static async getAvailability(userId) {
    const profile = await prisma.doctorProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundError('Doctor profile not found');

    return prisma.doctorAvailability.findMany({
      where: { doctorId: profile.id },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });
  }

  static async createAvailability(userId, data) {
    const profile = await prisma.doctorProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundError('Doctor profile not found');

    return prisma.doctorAvailability.create({ data: { doctorId: profile.id, ...data } });
  }

  static async updateAvailability(userId, availabilityId, data) {
    const profile = await prisma.doctorProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundError('Doctor profile not found');

    const slot = await prisma.doctorAvailability.findFirst({ where: { id: availabilityId, doctorId: profile.id } });
    if (!slot) throw new NotFoundError('Availability slot not found');

    return prisma.doctorAvailability.update({ where: { id: availabilityId }, data });
  }

  static async deleteAvailability(userId, availabilityId) {
    const profile = await prisma.doctorProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundError('Doctor profile not found');

    const slot = await prisma.doctorAvailability.findFirst({ where: { id: availabilityId, doctorId: profile.id } });
    if (!slot) throw new NotFoundError('Availability slot not found');

    return prisma.doctorAvailability.delete({ where: { id: availabilityId } });
  }

  static async getDashboardSummary(userId) {
    const profile = await prisma.doctorProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundError('Doctor profile not found');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [todayAppointments, totalAppointments, completedAppointments, avgRating, totalEarnings] = await Promise.all([
      prisma.appointment.count({ where: { doctorId: profile.id, appointmentDate: { gte: today }, status: { in: ['PENDING', 'CONFIRMED'] } } }),
      prisma.appointment.count({ where: { doctorId: profile.id } }),
      prisma.appointment.count({ where: { doctorId: profile.id, status: 'COMPLETED' } }),
      prisma.review.aggregate({ where: { doctorId: profile.id }, _avg: { rating: true } }),
      prisma.doctorPayout.aggregate({ where: { doctorId: profile.id, status: 'PAID' }, _sum: { netAmount: true } }),
    ]);

    return {
      todayAppointments,
      totalAppointments,
      completedAppointments,
      averageRating: avgRating._avg.rating || 0,
      totalEarnings: totalEarnings._sum.netAmount || 0,
    };
  }

  static async getAppointments(userId, query) {
    const profile = await prisma.doctorProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundError('Doctor profile not found');

    const { page, limit, skip } = buildPagination(query);
    const where = { doctorId: profile.id };
    if (query.status) where.status = query.status;
    if (query.date) where.appointmentDate = new Date(query.date);

    const [data, total] = await Promise.all([
      prisma.appointment.findMany({
        where, skip, take: limit, orderBy: { appointmentDate: 'desc' },
        include: {
          patient: { include: { user: { select: { fullName: true, avatarUrl: true } } } },
          speciality: { select: { nameAr: true, nameEn: true } },
          service: { select: { nameAr: true, nameEn: true, type: true } },
        },
      }),
      prisma.appointment.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  static async getPatients(userId) {
    const profile = await prisma.doctorProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundError('Doctor profile not found');

    const appointments = await prisma.appointment.findMany({
      where: { doctorId: profile.id },
      select: { patientId: true },
      distinct: ['patientId'],
    });

    const patientIds = appointments.map((a) => a.patientId);

    return prisma.patientProfile.findMany({
      where: { id: { in: patientIds } },
      include: { user: { select: { id: true, fullName: true, email: true, phone: true, avatarUrl: true } } },
    });
  }

  static async getPerformance(userId) {
    const profile = await prisma.doctorProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundError('Doctor profile not found');

    const [totalReviews, avgRating, completedThisMonth, cancelledThisMonth] = await Promise.all([
      prisma.review.count({ where: { doctorId: profile.id } }),
      prisma.review.aggregate({ where: { doctorId: profile.id }, _avg: { rating: true } }),
      prisma.appointment.count({ where: { doctorId: profile.id, status: 'COMPLETED', completedAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } } }),
      prisma.appointment.count({ where: { doctorId: profile.id, status: 'CANCELLED', updatedAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } } }),
    ]);

    return { totalReviews, averageRating: avgRating._avg.rating || 0, completedThisMonth, cancelledThisMonth };
  }

  static async getFinancialSummary(userId) {
    const profile = await prisma.doctorProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundError('Doctor profile not found');

    const [totalPaid, totalPending, recentPayouts] = await Promise.all([
      prisma.doctorPayout.aggregate({ where: { doctorId: profile.id, status: 'PAID' }, _sum: { netAmount: true } }),
      prisma.doctorPayout.aggregate({ where: { doctorId: profile.id, status: 'PENDING' }, _sum: { netAmount: true } }),
      prisma.doctorPayout.findMany({ where: { doctorId: profile.id }, take: 10, orderBy: { createdAt: 'desc' } }),
    ]);

    return {
      totalPaid: totalPaid._sum.netAmount || 0,
      totalPending: totalPending._sum.netAmount || 0,
      recentPayouts,
    };
  }
}

module.exports = DoctorService;

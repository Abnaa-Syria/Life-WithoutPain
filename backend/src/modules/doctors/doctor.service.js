const { NotFoundError } = require('../../shared/errors/AppError');
const { buildPagination } = require('../../utils/pagination');
const DoctorRepository = require('./doctor.repository');
const AppointmentRepository = require('../appointments/appointment.repository');
const ReviewRepository = require('../reviews/review.repository');
const DoctorPayoutRepository = require('../doctor-payouts/doctorPayout.repository');
const DoctorAvailabilityRepository = require('./doctorAvailability.repository');
const DoctorVerificationDocumentRepository = require('./doctorVerificationDocument.repository');
const PatientRepository = require('../patients/patient.repository');

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
      DoctorRepository.findMany({
        where, skip, take: limit,
        orderBy: query.sortBy === 'rating' ? { ratingAverage: 'desc' } : query.sortBy === 'fee' ? { consultationFee: 'asc' } : { createdAt: 'desc' },
        include: {
          user: { select: { id: true, fullName: true, avatarUrl: true } },
          speciality: { select: { id: true, nameAr: true, nameEn: true } },
          doctorServices: { include: { service: { select: { id: true, nameAr: true, nameEn: true, type: true } } } },
        },
      }),
      DoctorRepository.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  static async getById(doctorId) {
    const doctor = await DoctorRepository.findUnique({
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
    const profile = await DoctorRepository.findUnique({
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
    const profile = await DoctorRepository.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundError('Doctor profile not found');

    return DoctorRepository.update({ where: { userId }, data, include: { speciality: true } });
  }

  static async uploadVerificationDocument(userId, fileData) {
    const profile = await DoctorRepository.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundError('Doctor profile not found');

    return DoctorVerificationDocumentRepository.create({
      data: { doctorId: profile.id, ...fileData },
    });
  }

  static async getVerificationStatus(userId) {
    const profile = await DoctorRepository.findUnique({
      where: { userId },
      select: { id: true, verificationStatus: true, isPubliclyBookable: true },
    });
    if (!profile) throw new NotFoundError('Doctor profile not found');

    const documents = await DoctorVerificationDocumentRepository.findMany({
      where: { doctorId: profile.id },
      orderBy: { createdAt: 'desc' },
    });

    return { 
      verificationStatus: profile.verificationStatus, 
      isPubliclyBookable: profile.isPubliclyBookable, 
      documents 
    };
  }

  static async getAvailability(userId) {
    const profile = await DoctorRepository.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundError('Doctor profile not found');

    return DoctorAvailabilityRepository.findMany({
      where: { doctorId: profile.id },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });
  }

  static async createAvailability(userId, data) {
    const profile = await DoctorRepository.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundError('Doctor profile not found');

    return DoctorAvailabilityRepository.create({ data: { doctorId: profile.id, ...data } });
  }

  static async updateAvailability(userId, availabilityId, data) {
    const profile = await DoctorRepository.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundError('Doctor profile not found');

    const slot = await DoctorAvailabilityRepository.findFirst({ where: { id: availabilityId, doctorId: profile.id } });
    if (!slot) throw new NotFoundError('Availability slot not found');

    return DoctorAvailabilityRepository.update({ where: { id: availabilityId }, data });
  }

  static async deleteAvailability(userId, availabilityId) {
    const profile = await DoctorRepository.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundError('Doctor profile not found');

    const slot = await DoctorAvailabilityRepository.findFirst({ where: { id: availabilityId, doctorId: profile.id } });
    if (!slot) throw new NotFoundError('Availability slot not found');

    return DoctorAvailabilityRepository.delete({ where: { id: availabilityId } });
  }

  static async getDashboardSummary(userId) {
    const profile = await DoctorRepository.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundError('Doctor profile not found');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [todayAppointments, totalAppointments, completedAppointments, avgRating, totalEarnings] = await Promise.all([
      AppointmentRepository.count({ where: { doctorId: profile.id, appointmentDate: { gte: today }, status: { in: ['PENDING', 'CONFIRMED'] } } }),
      AppointmentRepository.count({ where: { doctorId: profile.id } }),
      AppointmentRepository.count({ where: { doctorId: profile.id, status: 'COMPLETED' } }),
      ReviewRepository.aggregateForDoctor(profile.id, { _avg: { rating: true } }),
      DoctorPayoutRepository.aggregateForDoctor(profile.id, { where: { status: 'PAID' }, _sum: { netAmount: true } }),
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
    const profile = await DoctorRepository.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundError('Doctor profile not found');

    const { page, limit, skip } = buildPagination(query);
    const where = { doctorId: profile.id };
    if (query.status) where.status = query.status;
    if (query.date) where.appointmentDate = new Date(query.date);

    const [data, total] = await Promise.all([
      AppointmentRepository.findMany({
        where, skip, take: limit, orderBy: { appointmentDate: 'desc' },
        include: {
          patient: { include: { user: { select: { fullName: true, avatarUrl: true } } } },
          speciality: { select: { nameAr: true, nameEn: true } },
          service: { select: { nameAr: true, nameEn: true, type: true } },
        },
      }),
      AppointmentRepository.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  static async getPatients(userId) {
    const profile = await DoctorRepository.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundError('Doctor profile not found');

    const appointments = await AppointmentRepository.findMany({
      where: { doctorId: profile.id },
      select: { patientId: true },
      distinct: ['patientId'],
    });

    const patientIds = appointments.map((a) => a.patientId);

    return PatientRepository.findMany({
      where: { id: { in: patientIds } },
      include: { user: { select: { id: true, fullName: true, email: true, phone: true, avatarUrl: true } } },
    });
  }

  static async getPerformance(userId) {
    const profile = await DoctorRepository.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundError('Doctor profile not found');

    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    const [totalReviews, avgRating, completedThisMonth, cancelledThisMonth] = await Promise.all([
      ReviewRepository.count({ where: { doctorId: profile.id } }),
      ReviewRepository.aggregateForDoctor(profile.id, { _avg: { rating: true } }),
      AppointmentRepository.count({ where: { doctorId: profile.id, status: 'COMPLETED', completedAt: { gte: startOfMonth } } }),
      AppointmentRepository.count({ where: { doctorId: profile.id, status: 'CANCELLED', updatedAt: { gte: startOfMonth } } }),
    ]);

    return { totalReviews, averageRating: avgRating._avg.rating || 0, completedThisMonth, cancelledThisMonth };
  }

  static async getFinancialSummary(userId) {
    const profile = await DoctorRepository.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundError('Doctor profile not found');

    const [totalPaid, totalPending, recentPayouts] = await Promise.all([
      DoctorPayoutRepository.aggregateForDoctor(profile.id, { where: { status: 'PAID' }, _sum: { netAmount: true } }),
      DoctorPayoutRepository.aggregateForDoctor(profile.id, { where: { status: 'PENDING' }, _sum: { netAmount: true } }),
      DoctorPayoutRepository.findMany({ where: { doctorId: profile.id }, take: 10, orderBy: { createdAt: 'desc' } }),
    ]);

    return {
      totalPaid: totalPaid._sum.netAmount || 0,
      totalPending: totalPending._sum.netAmount || 0,
      recentPayouts,
    };
  }
}

module.exports = DoctorService;

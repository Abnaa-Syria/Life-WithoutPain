const prisma = require('../../config/database');
const { enrichDoctorsForPatient } = require('../../i18n/enrichRelations');
const { NotFoundError } = require('../../shared/errors/AppError');
const { buildPagination } = require('../../utils/pagination');
const { resolveDoctorProfile, assertDoctorHasPatient } = require('../../shared/utils/doctorAppContext');
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

    if (query.specialityId || query.specializationId) {
      where.specialityId = parseInt(query.specialityId || query.specializationId, 10);
    }
    if (query.subSpecializationId) {
      where.subSpecialities = { some: { id: parseInt(query.subSpecializationId, 10) } };
    }
    if (query.subSpecializationIds) {
      const ids = String(query.subSpecializationIds).split(',').map((s) => parseInt(s.trim(), 10)).filter((n) => n > 0);
      if (ids.length) where.subSpecialities = { some: { id: { in: ids } } };
    }
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
          speciality: { select: { id: true, iconUrl: true } },
          subSpecialities: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
          doctorServices: { include: { service: { select: { id: true, type: true } } } },
        },
      }),
      DoctorRepository.count({ where }),
    ]);

    const withCounts = await Promise.all(
      data.map(async (doctor) => {
        const totalAppointmentsCount = await prisma.appointment.count({
          where: { doctorId: doctor.id, status: 'COMPLETED' },
        });
        return { ...doctor, totalAppointmentsCount };
      }),
    );

    return { data: await enrichDoctorsForPatient(withCounts), total, page, limit };
  }

  static async getById(doctorId) {
    return this.getPublicDetail(doctorId);
  }

  static async getPublicDetail(doctorId) {
    const doctor = await DoctorRepository.findUnique({
      where: { id: parseInt(doctorId, 10) },
      include: {
        user: { select: { id: true, fullName: true, avatarUrl: true } },
        speciality: true,
        subSpecialities: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
        doctorServices: { include: { service: true } },
        availability: { where: { isActive: true }, orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }] },
        verificationDocuments: { where: { reviewStatus: 'APPROVED' } },
        reviews: { where: { isVisible: true }, take: 10, orderBy: { createdAt: 'desc' }, include: { patient: { include: { user: { select: { fullName: true } } } } } },
      },
    });
    if (!doctor) throw new NotFoundError('DOCTOR_NOT_FOUND');
    const totalAppointmentsCount = await prisma.appointment.count({
      where: { doctorId: doctor.id, status: 'COMPLETED' },
    });
    return enrichDoctorsForPatient({ ...doctor, totalAppointmentsCount });
  }

  static async getAvailabilityForPatient(doctorId, query = {}) {
    const doctor = await DoctorRepository.findUnique({
      where: { id: parseInt(doctorId, 10) },
      include: {
        availability: { where: { isActive: true }, orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }] },
      },
    });
    if (!doctor || doctor.verificationStatus !== 'APPROVED' || !doctor.isPubliclyBookable) {
      throw new NotFoundError('DOCTOR_NOT_FOUND');
    }

    const dateFilter = query.date ? new Date(query.date) : null;
    const bookedWhere = {
      doctorId: doctor.id,
      status: { in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] },
    };
    if (dateFilter) bookedWhere.appointmentDate = dateFilter;

    const booked = await prisma.appointment.findMany({
      where: bookedWhere,
      select: { appointmentDate: true, startTime: true, endTime: true },
    });

    return {
      slots: doctor.availability,
      bookedAppointments: booked,
    };
  }

  static async listBySpeciality(specialityId, query = {}) {
    const result = await this.search({ ...query, specialityId });
    const data = await Promise.all(
      result.data.map(async (doctor) => {
        const [availabilityCount, upcomingBooked] = await Promise.all([
          prisma.doctorAvailability.count({ where: { doctorId: doctor.id, isActive: true } }),
          prisma.appointment.count({
            where: {
              doctorId: doctor.id,
              status: { in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] },
              appointmentDate: { gte: new Date() },
            },
          }),
        ]);
        const totalAppointmentsCount = await prisma.appointment.count({
          where: { doctorId: doctor.id, status: 'COMPLETED' },
        });
        return {
          ...doctor,
          availableAppointmentsCount: Math.max(0, availabilityCount * 4 - upcomingBooked),
          totalAppointmentsCount,
        };
      }),
    );
    return { ...result, data: await enrichDoctorsForPatient(data) };
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
    if (!profile) throw new NotFoundError('DOCTOR_PROFILE_NOT_FOUND');
    return profile;
  }

  static async updateProfile(userId, data) {
    const profile = await DoctorRepository.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundError('DOCTOR_PROFILE_NOT_FOUND');

    return DoctorRepository.update({ where: { userId }, data, include: { speciality: true } });
  }

  static async uploadVerificationDocument(userId, fileData) {
    const profile = await DoctorRepository.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundError('DOCTOR_PROFILE_NOT_FOUND');

    return DoctorVerificationDocumentRepository.create({
      data: { doctorId: profile.id, ...fileData },
    });
  }

  static async getVerificationStatus(userId) {
    const profile = await DoctorRepository.findUnique({
      where: { userId },
      select: { id: true, verificationStatus: true, isPubliclyBookable: true },
    });
    if (!profile) throw new NotFoundError('DOCTOR_PROFILE_NOT_FOUND');

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
    if (!profile) throw new NotFoundError('DOCTOR_PROFILE_NOT_FOUND');

    return DoctorAvailabilityRepository.findMany({
      where: { doctorId: profile.id },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });
  }

  static async createAvailability(userId, data) {
    const profile = await DoctorRepository.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundError('DOCTOR_PROFILE_NOT_FOUND');

    return DoctorAvailabilityRepository.create({ data: { doctorId: profile.id, ...data } });
  }

  static async createAvailabilityBulk(userId, payload) {
    const profile = await DoctorRepository.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundError('DOCTOR_PROFILE_NOT_FOUND');

    const dayMap = {
      sunday: 'SUNDAY', monday: 'MONDAY', tuesday: 'TUESDAY', wednesday: 'WEDNESDAY',
      thursday: 'THURSDAY', friday: 'FRIDAY', saturday: 'SATURDAY',
    };
    const days = (payload.days || []).map((d) => dayMap[String(d).toLowerCase()] || String(d).toUpperCase());
    const slots = [];

    for (const dayOfWeek of days) {
      if (payload.type === 'morning' || (!payload.type && payload.morningStart && payload.morningEnd)) {
        slots.push({
          doctorId: profile.id,
          dayOfWeek,
          periodType: 'MORNING',
          startDate: payload.startDate ? new Date(payload.startDate) : null,
          endDate: payload.endDate ? new Date(payload.endDate) : null,
          startTime: payload.type === 'morning' ? payload.startTime : payload.morningStart,
          endTime: payload.type === 'morning' ? payload.endTime : payload.morningEnd,
          slotDurationMinutes: payload.examinationDuration || 30,
          breakDurationMinutes: payload.breakDuration || 10,
          isActive: payload.isActive !== undefined ? payload.isActive : true,
        });
      }
      if (payload.type === 'night' || (!payload.type && payload.nightStart && payload.nightEnd)) {
        slots.push({
          doctorId: profile.id,
          dayOfWeek,
          periodType: 'EVENING',
          startDate: payload.startDate ? new Date(payload.startDate) : null,
          endDate: payload.endDate ? new Date(payload.endDate) : null,
          startTime: payload.type === 'night' ? payload.startTime : payload.nightStart,
          endTime: payload.type === 'night' ? payload.endTime : payload.nightEnd,
          slotDurationMinutes: payload.examinationDuration || 30,
          breakDurationMinutes: payload.breakDuration || 10,
          isActive: payload.isActive !== undefined ? payload.isActive : true,
        });
      }
    }

    if (slots.length === 0) {
      return DoctorAvailabilityRepository.findMany({ where: { doctorId: profile.id } });
    }

    await DoctorAvailabilityRepository.model.createMany({ data: slots });
    return DoctorAvailabilityRepository.findMany({
      where: { doctorId: profile.id },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });
  }

  static async updateAvailability(userId, availabilityId, data) {
    const profile = await DoctorRepository.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundError('DOCTOR_PROFILE_NOT_FOUND');

    const slot = await DoctorAvailabilityRepository.findFirst({ where: { id: availabilityId, doctorId: profile.id } });
    if (!slot) throw new NotFoundError('AVAILABILITY_SLOT_NOT_FOUND');

    return DoctorAvailabilityRepository.update({ where: { id: availabilityId }, data });
  }

  static async deleteAvailability(userId, availabilityId) {
    const profile = await DoctorRepository.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundError('DOCTOR_PROFILE_NOT_FOUND');

    const slot = await DoctorAvailabilityRepository.findFirst({ where: { id: availabilityId, doctorId: profile.id } });
    if (!slot) throw new NotFoundError('AVAILABILITY_SLOT_NOT_FOUND');

    return DoctorAvailabilityRepository.delete({ where: { id: availabilityId } });
  }

  static async getDashboardSummary(userId) {
    const profile = await DoctorRepository.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundError('DOCTOR_PROFILE_NOT_FOUND');

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
    if (!profile) throw new NotFoundError('DOCTOR_PROFILE_NOT_FOUND');

    const { page, limit, skip } = buildPagination(query);
    const where = { doctorId: profile.id };
    if (query.status) where.status = query.status;
    if (query.date) where.appointmentDate = new Date(query.date);

    const [data, total] = await Promise.all([
      AppointmentRepository.findMany({
        where, skip, take: limit, orderBy: { appointmentDate: 'desc' },
        include: {
          patient: { include: { user: { select: { fullName: true, avatarUrl: true } } } },
          speciality: true,
          service: true,
        },
      }),
      AppointmentRepository.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  static async getPatients(userId) {
    const profile = await DoctorRepository.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundError('DOCTOR_PROFILE_NOT_FOUND');

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
    if (!profile) throw new NotFoundError('DOCTOR_PROFILE_NOT_FOUND');

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
    if (!profile) throw new NotFoundError('DOCTOR_PROFILE_NOT_FOUND');

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

  static async approveDoctor(id) {
    const doctor = await DoctorRepository.findUnique({ where: { id: parseInt(id) } });
    if (!doctor) throw new NotFoundError('DOCTOR_NOT_FOUND');

    return DoctorRepository.update({
      where: { id: parseInt(id) },
      data: {
        verificationStatus: 'APPROVED',
        isPubliclyBookable: true,
      },
    });
  }

  static async rejectDoctor(id, notes) {
    const doctor = await DoctorRepository.findUnique({ where: { id: parseInt(id) } });
    if (!doctor) throw new NotFoundError('DOCTOR_NOT_FOUND');

    return DoctorRepository.update({
      where: { id: parseInt(id) },
      data: {
        verificationStatus: 'REJECTED',
        isPubliclyBookable: false,
      },
    });
  }

  static calcAge(dateOfBirth) {
    if (!dateOfBirth) return null;
    const dob = new Date(dateOfBirth);
    const diff = Date.now() - dob.getTime();
    return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
  }

  static async getPatientsWithLastVisit(userId) {
    const { doctorId } = await resolveDoctorProfile(userId);
    const patients = await this.getPatients(userId);

    const enriched = await Promise.all(patients.map(async (p) => {
      const lastAppt = await AppointmentRepository.findFirst({
        where: { doctorId, patientId: p.id },
        orderBy: { appointmentDate: 'desc' },
      });
      return {
        ...p,
        lastVisitDate: lastAppt?.appointmentDate || null,
        age: this.calcAge(p.dateOfBirth),
      };
    }));
    return enriched;
  }

  static async getPatientDetailForDoctor(userId, patientId) {
    const { doctorId } = await resolveDoctorProfile(userId);
    await assertDoctorHasPatient(doctorId, patientId);

    const patient = await PatientRepository.findUnique({
      where: { id: parseInt(patientId) },
      include: {
        user: { select: { fullName: true } },
        medicalProfile: {
          include: {
            chronicDiseases: { where: { isActive: true }, orderBy: { id: 'asc' } },
            medications: { where: { isActive: true }, orderBy: { id: 'asc' } },
            allergies: { where: { isActive: true }, orderBy: { id: 'asc' } },
            attachments: { orderBy: { createdAt: 'desc' } },
          },
        },
      },
    });
    if (!patient) throw new NotFoundError('PATIENT_NOT_FOUND');

    const [nextAppointment, prescriptions, reports] = await Promise.all([
      AppointmentRepository.findFirst({
        where: {
          doctorId,
          patientId: patient.id,
          appointmentDate: { gte: new Date() },
          status: { in: ['PENDING', 'CONFIRMED'] },
        },
        orderBy: { appointmentDate: 'asc' },
      }),
      prisma.prescription.findMany({
        where: { doctorId, patientId: patient.id },
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: { items: true },
      }),
      prisma.medicalReport.findMany({
        where: { doctorId, patientId: patient.id },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
    ]);

    const { mapPatientDetail } = require('../../shared/utils/doctorAppMappers');
    return mapPatientDetail(patient, { nextAppointment, prescriptions, reports });
  }

  static async getClinicDetails(userId) {
    const profile = await DoctorRepository.findUnique({
      where: { userId },
      include: {
        user: { select: { phone: true } },
        availability: { where: { isActive: true }, orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }] },
      },
    });
    if (!profile) throw new NotFoundError('DOCTOR_PROFILE_NOT_FOUND');

    return {
      clinicName: profile.workplace,
      address: profile.clinicAddress || profile.workplace,
      city: profile.city,
      phone: profile.user?.phone,
      workingHours: profile.availability,
    };
  }

  static async updateClinicDetails(userId, data) {
    const profile = await DoctorRepository.findUnique({
      where: { userId },
      include: { user: { select: { id: true, phone: true } } },
    });
    if (!profile) throw new NotFoundError('DOCTOR_PROFILE_NOT_FOUND');

    const workplace = data.clinicName ?? data.address ?? profile.workplace;

    await DoctorRepository.update({
      where: { userId },
      data: {
        workplace,
        clinicAddress: data.address ?? profile.clinicAddress,
        city: data.city ?? profile.city,
      },
    });

    if (data.phone) {
      await prisma.user.update({ where: { id: userId }, data: { phone: data.phone } });
    }

    return this.getClinicDetails(userId);
  }

  static async getSettings(userId) {
    const { profile } = await resolveDoctorProfile(userId);
    return {
      language: profile.user.preferredLanguage,
      notificationsEnabled: profile.isAvailable,
      privacy: {},
      darkModeEnabled: profile.user.darkModeEnabled,
    };
  }

  static async updateSettings(userId, data) {
    const { BadRequestError } = require('../../shared/errors/AppError');
    const update = {};
    const language = data.language ?? data.preferredLanguage;
    if (language !== undefined) {
      const normalized = String(language).toLowerCase();
      if (!['ar', 'en'].includes(normalized)) {
        throw new BadRequestError('LANGUAGE_INVALID');
      }
      update.preferredLanguage = normalized;
    }
    if (data.darkModeEnabled !== undefined) update.darkModeEnabled = data.darkModeEnabled;

    if (Object.keys(update).length) {
      await prisma.user.update({ where: { id: userId }, data: update });
    }

    if (data.notificationsEnabled !== undefined) {
      await DoctorRepository.update({
        where: { userId },
        data: { isAvailable: Boolean(data.notificationsEnabled) },
      });
    }

    return this.getSettings(userId);
  }

  static async updateProfileForDoctor(userId, data) {
    const profile = await DoctorRepository.findUnique({ where: { userId }, include: { user: true } });
    if (!profile) throw new NotFoundError('DOCTOR_PROFILE_NOT_FOUND');

    const userData = {};
    if (data.name) userData.fullName = data.name;
    if (data.phoneNumber) userData.phone = data.phoneNumber;
    if (data.language) userData.preferredLanguage = data.language;

    const profileData = {};
    if (data.identityNumber) profileData.licenseNumber = data.identityNumber;
    if (data.bio !== undefined) profileData.bio = data.bio;
    if (data.bioAr !== undefined) profileData.bioAr = data.bioAr;

    if (Object.keys(userData).length) {
      await prisma.user.update({ where: { id: userId }, data: userData });
    }
    if (Object.keys(profileData).length) {
      await DoctorRepository.update({ where: { userId }, data: profileData });
    }

    const updated = await this.getProfile(userId);
    return {
      ...updated,
      language: updated.user?.preferredLanguage,
      name: updated.user?.fullName,
      phoneNumber: updated.user?.phone,
    };
  }
}

module.exports = DoctorService;

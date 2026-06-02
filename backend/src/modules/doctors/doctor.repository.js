const BaseRepository = require('../../shared/repositories/BaseRepository');
const prisma = require('../../config/database');

class DoctorRepository extends BaseRepository {
  constructor() {
    super('doctorProfile');
  }

  async findWithUser(id, includes = {}) {
    return this.model.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: true,
        speciality: true,
        ...includes,
      },
    });
  }

  async findWithDetails(id) {
    return this.model.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            avatarUrl: true,
            status: true,
          },
        },
        speciality: true,
        subSpecialities: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
        verificationDocuments: true,
        doctorServices: {
          include: {
            service: true,
          },
        },
        appointments: {
          orderBy: { appointmentDate: 'desc' },
          take: 50,
          include: {
            patient: { include: { user: { select: { fullName: true } } } },
            service: { select: { nameAr: true, nameEn: true } },
          },
        },
        prescriptions: {
          orderBy: { createdAt: 'desc' },
          take: 50,
          include: {
            items: true,
            patient: { include: { user: { select: { fullName: true } } } },
          },
        },
        reports: {
          orderBy: { createdAt: 'desc' },
          take: 50,
          include: {
            patient: { include: { user: { select: { fullName: true } } } },
          },
        },
      },
    });
  }

  async list(params = {}) {
    const { skip, take, where, include } = params;
    return this.model.findMany({
      skip,
      take,
      where,
      include: include || {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            status: true,
          },
        },
        speciality: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateWithUser(id, profileData, userData) {
    return prisma.$transaction(async (tx) => {
      const profile = await tx.doctorProfile.update({
        where: { id: parseInt(id) },
        data: profileData,
      });

      if (userData) {
        await tx.user.update({
          where: { id: profile.userId },
          data: userData,
        });
      }

      return profile;
    });
  }
}

module.exports = new DoctorRepository();

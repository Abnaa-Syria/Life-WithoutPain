const prisma = require('../../config/database');
const { NotFoundError, BadRequestError, ForbiddenError } = require('../../shared/errors/AppError');
const { APPOINTMENT_STATUS_TRANSITIONS } = require('../../constants');
const { buildPagination } = require('../../utils/pagination');
const { eventEmitter, EVENTS } = require('../../shared/events/eventEmitter');
const { resolveDoctorProfile, assertDoctorOwnsAppointment } = require('../../shared/utils/doctorAppContext');
const { resolvePatientProfile, assertPatientOwnsAppointment } = require('../../shared/utils/patientAppContext');
const { isComingAppointment } = require('../../shared/utils/patientAppMappers');

function appointmentOrderBy(dateDir = 'desc', timeDir = 'desc') {
  return [{ appointmentDate: dateDir }, { startTime: timeDir }];
}

class AppointmentService {
  static normalizeBookingBody(data) {
    const body = { ...data };
    if (body.bookingMethod) {
      const method = String(body.bookingMethod).toLowerCase();
      body.paymentMode = method === 'medicalinsurance' || method === 'insurance' ? 'INSURANCE' : 'DIRECT';
    }
    return body;
  }

  static async getUpcomingForPatient(userId, query) {
    const { patientId } = await resolvePatientProfile(userId);
    const { page, limit, skip } = buildPagination(query);
    const where = {
      patientId,
      status: 'CONFIRMED',
      appointmentDate: { gte: new Date() },
    };
    const include = {
      doctor: { include: { user: { select: { fullName: true, avatarUrl: true } }, speciality: true } },
      service: true,
      insuranceCases: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: { approvals: { orderBy: { createdAt: 'desc' }, take: 1 } },
      },
    };
    const [data, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ appointmentDate: 'asc' }, { startTime: 'asc' }],
        include,
      }),
      prisma.appointment.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  static async listBookingsForPatient(userId, query) {
    const filter = (query.status || query.filter || 'all').toLowerCase();
    const appointmentQuery = { ...query, filter: filter === 'finished' ? 'completed' : filter };
    const appointments = await this.listForPatient(userId, { ...appointmentQuery, limit: 1000, page: 1 });
    const HomeServiceService = require('../home-services/home-service.service');
    const homeResult = await HomeServiceService.listForPatient(userId, { ...query, limit: 1000, page: 1 });

    const { mapAppointmentListItem, mapHomeServiceRequestListItem } = require('../../shared/utils/patientAppMappers');

    let items = [
      ...appointments.data.map((a) => ({
        bookingType: 'appointment',
        serviceType: a.service?.type || 'CLINIC',
        ...mapAppointmentListItem(a),
      })),
      ...homeResult.data.map((h) => ({
        bookingType: 'homeService',
        serviceType: 'HOME',
        paymentStatus: h.paymentStatus || 'PENDING',
        ...mapHomeServiceRequestListItem(h),
      })),
    ];

    if (filter === 'confirmed') {
      items = items.filter((i) => i.status === 'CONFIRMED' || i.status === 'SCHEDULED' || i.status === 'ASSIGNED');
    } else if (filter === 'cancelled') {
      items = items.filter((i) => i.status === 'CANCELLED');
    } else if (filter === 'finished' || filter === 'completed') {
      items = items.filter((i) => i.status === 'COMPLETED');
    }

    items.sort((a, b) => {
      const da = a.appointmentDate || a.preferredDate;
      const db = b.appointmentDate || b.preferredDate;
      return new Date(db) - new Date(da);
    });

    const { page, limit, skip } = buildPagination(query);
    const total = items.length;
    const data = items.slice(skip, skip + limit);
    return { data, total, page, limit };
  }

  static async createForPatient(userId, data) {
    data = this.normalizeBookingBody(data);
    const requiresInsuranceApproval = data.paymentMode === 'INSURANCE';
    if (requiresInsuranceApproval) {
      const patient = await prisma.patientProfile.findUnique({ where: { userId } });
      const policyCount = patient
        ? await prisma.patientInsurance.count({ where: { patientId: patient.id } })
        : 0;
      if (!policyCount) {
        throw new BadRequestError('Add an insurance policy before booking with medical insurance.');
      }
    }
    if (data.bookingFor === 'family' && !data.familyMemberId) {
      throw new BadRequestError('familyMemberId is required when booking for a family member');
    }

    if (data.serviceId) {
      const service = await prisma.service.findUnique({ where: { id: data.serviceId } });
      if (service?.type === 'HOME') {
        throw new BadRequestError('Home visits must be requested via POST /patient/home-services');
      }
    }

    const patient = await prisma.patientProfile.findUnique({ where: { userId } });
    if (!patient) throw new NotFoundError('Patient profile not found');

    if (data.bookingFor === 'family' && data.familyMemberId) {
      const member = await prisma.familyMember.findFirst({
        where: { id: data.familyMemberId, patientId: patient.id },
      });
      if (!member) throw new BadRequestError('Family member not found');
    }

    return this.create(userId, {
      ...data,
      familyMemberId: data.bookingFor === 'family' ? data.familyMemberId : null,
      requiresInsuranceApproval,
      patientInsuranceId: data.patientInsuranceId,
    });
  }

  static async listForPatient(userId, query) {
    const { patientId } = await resolvePatientProfile(userId);
    const { page, limit, skip } = buildPagination(query);
    const filter = (query.filter || 'all').toLowerCase();

    const where = { patientId };
    let orderBy = appointmentOrderBy('asc', 'asc');

    if (filter === 'confirmed') where.status = 'CONFIRMED';
    else if (filter === 'cancelled') where.status = 'CANCELLED';
    else if (filter === 'completed' || filter === 'finished') where.status = 'COMPLETED';
    else if (filter === 'coming') {
      where.status = { notIn: ['CANCELLED', 'COMPLETED'] };
    } else if (filter === 'all') {
      orderBy = appointmentOrderBy('desc', 'desc');
    }

    if (query.startDate || query.endDate) {
      where.appointmentDate = {};
      if (query.startDate) where.appointmentDate.gte = new Date(query.startDate);
      if (query.endDate) where.appointmentDate.lte = new Date(query.endDate);
    } else if (query.date) {
      where.appointmentDate = new Date(query.date);
    }

    const include = {
      doctor: { include: { user: { select: { fullName: true, avatarUrl: true } }, speciality: true } },
      service: true,
      insuranceCases: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: { approvals: { orderBy: { createdAt: 'desc' }, take: 1 } },
      },
    };

    if (filter === 'coming') {
      const rows = await prisma.appointment.findMany({
        where,
        include,
        orderBy,
      });
      const filtered = rows.filter((row) => isComingAppointment(row));
      const total = filtered.length;
      const data = filtered.slice(skip, skip + limit);
      return { data, total, page, limit };
    }

    const [data, total] = await Promise.all([
      prisma.appointment.findMany({ where, skip, take: limit, orderBy, include }),
      prisma.appointment.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  static async getByIdForPatient(userId, id) {
    const { patientId } = await resolvePatientProfile(userId);
    await assertPatientOwnsAppointment(patientId, id);
    const appointment = await prisma.appointment.findUnique({
      where: { id: parseInt(id, 10) },
      include: {
        doctor: {
          include: {
            user: { select: { id: true, fullName: true, avatarUrl: true } },
            speciality: true,
            subSpecialities: { where: { isActive: true } },
            verificationDocuments: { where: { reviewStatus: 'APPROVED' } },
            reviews: { where: { isVisible: true }, take: 10, orderBy: { createdAt: 'desc' }, include: { patient: { include: { user: { select: { fullName: true } } } } } },
          },
        },
        service: true,
        attachments: true,
        prescriptions: true,
        reports: true,
        labTests: { include: { results: true } },
        familyMember: true,
      },
    });
    if (!appointment) throw new NotFoundError('Appointment not found');
    return appointment;
  }

  static async cancelForPatient(userId, id, data) {
    const { patientId } = await resolvePatientProfile(userId);
    await assertPatientOwnsAppointment(patientId, id);
    await this.updateStatus(id, 'CANCELLED', userId, data);
    return this.getByIdForPatient(userId, id);
  }

  static async rescheduleForPatient(userId, id, data) {
    const { patientId } = await resolvePatientProfile(userId);
    await assertPatientOwnsAppointment(patientId, id);
    await this.updateStatus(id, 'RESCHEDULED', userId, {
      newDate: data.appointmentDate,
      newStartTime: data.startTime,
      newEndTime: data.endTime,
      reason: data.reason,
    });
    return this.getByIdForPatient(userId, id);
  }

  static async create(userId, data) {
    const patient = await prisma.patientProfile.findUnique({ where: { userId } });
    if (!patient) throw new NotFoundError('Patient profile not found');

    const doctor = await prisma.doctorProfile.findUnique({ where: { id: data.doctorId } });
    if (!doctor) throw new NotFoundError('Doctor not found');
    if (!doctor.isPubliclyBookable || doctor.verificationStatus !== 'APPROVED') {
      throw new BadRequestError('Doctor is not available for booking');
    }

    // Validate time slot availability
    const dayOfWeek = new Date(data.appointmentDate).toLocaleString('en-US', { weekday: 'long' }).toUpperCase();
    const availability = await prisma.doctorAvailability.findFirst({
      where: { doctorId: doctor.id, dayOfWeek, isActive: true, startTime: { lte: data.startTime }, endTime: { gte: data.endTime } },
    });

    if (!availability) {
      throw new BadRequestError('Selected time slot is not available');
    }

    // Check double booking
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        doctorId: doctor.id,
        appointmentDate: new Date(data.appointmentDate),
        status: { in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] },
        OR: [
          { startTime: { lte: data.startTime }, endTime: { gt: data.startTime } },
          { startTime: { lt: data.endTime }, endTime: { gte: data.endTime } },
          { startTime: { gte: data.startTime }, endTime: { lte: data.endTime } },
        ],
      },
    });

    if (existingAppointment) {
      throw new BadRequestError('This time slot is already booked');
    }

    const appointment = await prisma.appointment.create({
      data: {
        patientId: patient.id,
        doctorId: doctor.id,
        specialityId: data.specialityId || doctor.specialityId,
        serviceId: data.serviceId || null,
        familyMemberId: data.familyMemberId || null,
        appointmentType: data.appointmentType || 'CONSULTATION',
        appointmentDate: new Date(data.appointmentDate),
        startTime: data.startTime,
        endTime: data.endTime,
        amount: doctor.consultationFee,
        notes: data.notes || null,
        requiresInsuranceApproval: data.requiresInsuranceApproval || false,
        createdBy: userId,
      },
      include: {
        doctor: { include: { user: { select: { fullName: true, avatarUrl: true } }, speciality: true } },
        patient: { include: { user: { select: { fullName: true } } } },
        service: true,
      },
    });

    // Emit event for side effects (notifications, etc)
    eventEmitter.emit(EVENTS.APPOINTMENT.CREATED, appointment);

    if (data.requiresInsuranceApproval) {
      const InsuranceRequestOrchestrator = require('../insurance-cases/insuranceRequest.orchestrator');
      await InsuranceRequestOrchestrator.createForAppointment(appointment, {
        patientInsuranceId: data.patientInsuranceId,
      });
      return prisma.appointment.findUnique({
        where: { id: appointment.id },
        include: {
          doctor: { include: { user: { select: { fullName: true, avatarUrl: true } }, speciality: true } },
          patient: { include: { user: { select: { fullName: true } } } },
          service: true,
          insuranceCases: { orderBy: { createdAt: 'desc' }, take: 1 },
        },
      });
    }

    return appointment;
  }

  static async getAll(userRole, userId, query) {
    const { page, limit, skip } = buildPagination(query);
    const where = {};

    if (userRole === 'PATIENT') {
      const patient = await prisma.patientProfile.findUnique({ where: { userId } });
      if (!patient) throw new NotFoundError('Patient profile not found');
      where.patientId = patient.id;
    } else if (userRole === 'DOCTOR') {
      const doctor = await prisma.doctorProfile.findUnique({ where: { userId } });
      if (doctor) where.doctorId = doctor.id;
    }
    if (query.status) where.status = query.status;
    if (query.doctorId) where.doctorId = parseInt(query.doctorId);
    if (query.patientId) where.patientId = parseInt(query.patientId);
    
    if (query.startDate || query.endDate) {
      where.appointmentDate = {};
      if (query.startDate) where.appointmentDate.gte = new Date(query.startDate);
      if (query.endDate) where.appointmentDate.lte = new Date(query.endDate);
    } else if (query.date) {
      where.appointmentDate = new Date(query.date);
    }

    const [data, total] = await Promise.all([
      prisma.appointment.findMany({
        where, skip, take: limit, orderBy: appointmentOrderBy('desc', 'desc'),
        include: {
          patient: { include: { user: { select: { fullName: true, avatarUrl: true } } } },
          doctor: { include: { user: { select: { fullName: true, avatarUrl: true } }, speciality: true } },
          service: true,
        },
      }),
      prisma.appointment.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  static async getById(id, userRole, userId) {
    const appointment = await prisma.appointment.findUnique({
      where: { id: parseInt(id) },
      include: {
        patient: { include: { user: { select: { id: true, fullName: true, email: true, phone: true, avatarUrl: true } }, medicalProfile: true } },
        doctor: { include: { user: { select: { id: true, fullName: true, avatarUrl: true } }, speciality: true } },
        service: true,
        attachments: true,
        prescriptions: true,
        reports: true,
        labTests: { include: { results: true } },
        reviews: true,
      },
    });
    if (!appointment) throw new NotFoundError('Appointment not found');

    if (userRole === 'PATIENT') {
      const patient = await prisma.patientProfile.findUnique({ where: { userId } });
      if (!patient || appointment.patientId !== patient.id) {
        throw new ForbiddenError('You do not have access to this appointment');
      }
    } else if (userRole === 'DOCTOR') {
      const doctor = await prisma.doctorProfile.findUnique({ where: { userId } });
      if (!doctor || appointment.doctorId !== doctor.id) {
        throw new ForbiddenError('You do not have access to this appointment');
      }
    }

    return appointment;
  }

  static async updateStatus(id, newStatus, userId, data = {}) {
    const appointment = await prisma.appointment.findUnique({ where: { id: parseInt(id) } });
    if (!appointment) throw new NotFoundError('Appointment not found');

    const allowed = APPOINTMENT_STATUS_TRANSITIONS[appointment.status] || [];
    if (!allowed.includes(newStatus)) {
      throw new BadRequestError(`Cannot transition from ${appointment.status} to ${newStatus}`);
    }

    const updateData = { status: newStatus };
    if (newStatus === 'CONFIRMED') updateData.confirmedAt = new Date();
    if (newStatus === 'IN_PROGRESS') updateData.startedAt = new Date();
    if (newStatus === 'COMPLETED') updateData.completedAt = new Date();
    if (newStatus === 'CANCELLED') updateData.cancellationReason = data.reason || null;
    if (newStatus === 'RESCHEDULED' && data.newDate) {
      updateData.appointmentDate = new Date(data.newDate);
      updateData.startTime = data.newStartTime || appointment.startTime;
      updateData.endTime = data.newEndTime || appointment.endTime;
    }

    const previousStatus = appointment.status;
    const updated = await prisma.appointment.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        doctor: { include: { user: { select: { id: true, fullName: true } } } },
        patient: { include: { user: { select: { id: true, fullName: true } } } },
        service: true,
      },
    });

    eventEmitter.emit(EVENTS.APPOINTMENT.STATUS_CHANGED, {
      appointment: updated,
      previousStatus,
    });

    if (newStatus === 'CANCELLED') {
      eventEmitter.emit(EVENTS.APPOINTMENT.CANCELLED, { appointment: updated, previousStatus });
    }

    return updated;
  }

  static async addAttachment(appointmentId, fileData) {
    return prisma.appointmentAttachment.create({
      data: { appointmentId: parseInt(appointmentId), ...fileData },
    });
  }

  static async getAttachments(appointmentId) {
    return prisma.appointmentAttachment.findMany({
      where: { appointmentId: parseInt(appointmentId) },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getForDoctor(userId, query) {
    const { doctorId } = await resolveDoctorProfile(userId);
    const { page, limit, skip } = buildPagination(query);
    const where = { doctorId };
    if (query.status) where.status = query.status;
    if (query.type) where.appointmentType = query.type;
    
    if (query.startDate || query.endDate) {
      where.appointmentDate = {};
      if (query.startDate) where.appointmentDate.gte = new Date(query.startDate);
      if (query.endDate) where.appointmentDate.lte = new Date(query.endDate);
    } else if (query.date) {
      where.appointmentDate = new Date(query.date);
    }

    const [data, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        skip,
        take: limit,
        orderBy: appointmentOrderBy('desc', 'desc'),
        include: {
          patient: { include: { user: { select: { fullName: true, avatarUrl: true } } } },
          service: { select: { nameAr: true, nameEn: true } },
        },
      }),
      prisma.appointment.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  static async getByIdForDoctor(userId, id) {
    const { doctorId } = await resolveDoctorProfile(userId);
    await assertDoctorOwnsAppointment(doctorId, id);
    return this.getById(id);
  }

  static async updateStatusForDoctor(userId, id, newStatus, data = {}) {
    const { doctorId } = await resolveDoctorProfile(userId);
    await assertDoctorOwnsAppointment(doctorId, id);
    return this.updateStatus(id, newStatus, userId, data);
  }
}

module.exports = AppointmentService;

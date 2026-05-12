const prisma = require('../../config/database');
const { NotFoundError, BadRequestError, ForbiddenError } = require('../../shared/errors/AppError');
const { APPOINTMENT_STATUS_TRANSITIONS } = require('../../constants');
const { buildPagination } = require('../../utils/pagination');
const { eventEmitter, EVENTS } = require('../../shared/events/eventEmitter');

class AppointmentService {
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
        doctor: { include: { user: { select: { fullName: true } } } },
        patient: { include: { user: { select: { fullName: true } } } },
      },
    });

    // Emit event for side effects (notifications, etc)
    eventEmitter.emit(EVENTS.APPOINTMENT.CREATED, appointment);

    return appointment;
  }

  static async getAll(query) {
    const { page, limit, skip } = buildPagination(query);
    const where = {};
    if (query.status) where.status = query.status;
    if (query.doctorId) where.doctorId = parseInt(query.doctorId);
    if (query.patientId) where.patientId = parseInt(query.patientId);
    if (query.date) where.appointmentDate = new Date(query.date);

    const [data, total] = await Promise.all([
      prisma.appointment.findMany({
        where, skip, take: limit, orderBy: { appointmentDate: 'desc' },
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

  static async getById(id) {
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

    return prisma.appointment.update({ where: { id: parseInt(id) }, data: updateData });
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
}

module.exports = AppointmentService;

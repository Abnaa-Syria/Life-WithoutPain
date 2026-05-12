const ReviewRepository = require('./review.repository');
const AppointmentRepository = require('../appointments/appointment.repository');
const PatientRepository = require('../patients/patient.repository');
const DoctorRepository = require('../doctors/doctor.repository');
const { BadRequestError } = require('../../shared/errors/AppError');
const { buildPagination } = require('../../utils/pagination');

class ReviewService {
  static async create(userId, body) {
    const appointment = await AppointmentRepository.findUnique({ where: { id: body.appointmentId } });
    if (!appointment || appointment.status !== 'COMPLETED') {
      throw new BadRequestError('Can only review completed appointments');
    }

    const patient = await PatientRepository.findUnique({ where: { userId } });

    const review = await ReviewRepository.create({
      data: {
        appointmentId: body.appointmentId,
        patientId: patient.id,
        doctorId: body.doctorId,
        rating: body.rating,
        comment: body.comment,
      },
    });

    // Update doctor rating average
    const stats = await ReviewRepository.aggregate({
      where: { doctorId: body.doctorId },
      _avg: { rating: true },
      _count: true,
    });
    await DoctorRepository.update({
      where: { id: body.doctorId },
      data: { ratingAverage: stats._avg.rating || 0, ratingCount: stats._count },
    });

    return review;
  }

  static async listByDoctor(doctorId, query) {
    const { page, limit, skip } = buildPagination(query);
    const where = { doctorId: parseInt(doctorId), isVisible: true };

    const [data, total] = await Promise.all([
      ReviewRepository.findMany({
        where, skip, take: limit, orderBy: { createdAt: 'desc' },
        include: { patient: { include: { user: { select: { fullName: true, avatarUrl: true } } } } },
      }),
      ReviewRepository.count({ where }),
    ]);
    return { data, total, page, limit };
  }
}

module.exports = ReviewService;

const router = require('express').Router();
const { authenticate, authorize } = require('../../middlewares/auth');
const { asyncHandler } = require('../../utils/helpers');
const { successResponse, createdResponse, paginatedResponse } = require('../../shared/responses');
const { buildPagination } = require('../../utils/pagination');
const prisma = require('../../config/database');
const { ROLES } = require('../../constants');
const { BadRequestError } = require('../../shared/errors/AppError');

router.post('/', authenticate, authorize(ROLES.PATIENT), asyncHandler(async (req, res) => {
  const appointment = await prisma.appointment.findUnique({ where: { id: req.body.appointmentId } });
  if (!appointment || appointment.status !== 'COMPLETED') {
    throw new BadRequestError('Can only review completed appointments');
  }

  const patient = await prisma.patientProfile.findUnique({ where: { userId: req.user.id } });

  const review = await prisma.review.create({
    data: {
      appointmentId: req.body.appointmentId,
      patientId: patient.id,
      doctorId: req.body.doctorId,
      rating: req.body.rating,
      comment: req.body.comment,
    },
  });

  // Update doctor rating average
  const stats = await prisma.review.aggregate({ where: { doctorId: req.body.doctorId }, _avg: { rating: true }, _count: true });
  await prisma.doctorProfile.update({
    where: { id: req.body.doctorId },
    data: { ratingAverage: stats._avg.rating || 0, ratingCount: stats._count },
  });

  return createdResponse(res, { data: review });
}));

router.get('/doctor/:doctorId', asyncHandler(async (req, res) => {
  const { page, limit, skip } = buildPagination(req.query);
  const where = { doctorId: parseInt(req.params.doctorId), isVisible: true };

  const [data, total] = await Promise.all([
    prisma.review.findMany({
      where, skip, take: limit, orderBy: { createdAt: 'desc' },
      include: { patient: { include: { user: { select: { fullName: true, avatarUrl: true } } } } },
    }),
    prisma.review.count({ where }),
  ]);
  return paginatedResponse(res, { data, total, page, limit });
}));

module.exports = router;

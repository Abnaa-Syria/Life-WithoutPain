const router = require('express').Router();
const { authenticate, authorize } = require('../../middlewares/auth');
const { asyncHandler } = require('../../utils/helpers');
const { successResponse } = require('../../shared/responses');
const prisma = require('../../config/database');
const { ROLES, ADMIN_ROLES } = require('../../constants');

router.use(authenticate);

router.get('/', authorize(...ADMIN_ROLES), asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [
    totalPatients, totalDoctors, totalAppointments,
    todayAppointments, pendingVerifications, openInsuranceCases,
    openSupportCases, monthlyRevenue, completedAppointments,
    pendingPayouts,
  ] = await Promise.all([
    prisma.patientProfile.count(),
    prisma.doctorProfile.count(),
    prisma.appointment.count(),
    prisma.appointment.count({ where: { appointmentDate: { gte: today } } }),
    prisma.doctorProfile.count({ where: { verificationStatus: 'PENDING' } }),
    prisma.insuranceCase.count({ where: { status: { in: ['OPEN', 'UNDER_REVIEW', 'ESCALATED'] } } }),
    prisma.supportCase.count({ where: { status: { in: ['OPEN', 'IN_PROGRESS'] } } }),
    prisma.payment.aggregate({ where: { status: 'PAID', paidAt: { gte: thisMonth } }, _sum: { amount: true } }),
    prisma.appointment.count({ where: { status: 'COMPLETED', completedAt: { gte: thisMonth } } }),
    prisma.doctorPayout.aggregate({ where: { status: 'PENDING' }, _sum: { netAmount: true } }),
  ]);

  return successResponse(res, {
    data: {
      totalPatients,
      totalDoctors,
      totalAppointments,
      todayAppointments,
      pendingVerifications,
      openInsuranceCases,
      openSupportCases,
      monthlyRevenue: monthlyRevenue._sum.amount || 0,
      completedThisMonth: completedAppointments,
      pendingPayouts: pendingPayouts._sum.netAmount || 0,
    },
  });
}));

module.exports = router;

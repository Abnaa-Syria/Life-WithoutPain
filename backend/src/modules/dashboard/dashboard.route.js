const router = require('express').Router();
const { authenticate } = require('../../middlewares/auth');
const { guard, ADMIN_ROLES } = require('../admin/admin.permissions');
const { asyncHandler } = require('../../utils/helpers');
const { successResponse } = require('../../shared/responses');
const prisma = require('../../config/database');

router.use(authenticate);

router.get('/', guard('dashboard.view', ...ADMIN_ROLES), asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [
    totalPatients, totalDoctors, totalAppointments,
    todayAppointments, pendingVerifications, openInsuranceCases,
    insuranceApprovedToday, pendingInsurancePolicies,
    openSupportCases, monthlyRevenue, completedAppointments,
    pendingPayouts,
  ] = await Promise.all([
    prisma.patientProfile.count(),
    prisma.doctorProfile.count(),
    prisma.appointment.count(),
    prisma.appointment.count({ where: { appointmentDate: { gte: today } } }),
    prisma.doctorProfile.count({ where: { verificationStatus: 'PENDING' } }),
    prisma.insuranceCase.count({ where: { status: { in: ['OPEN', 'UNDER_REVIEW', 'ESCALATED'] } } }),
    prisma.insuranceCase.count({
      where: { status: 'APPROVED', resolvedAt: { gte: today, lt: tomorrow } },
    }),
    prisma.patientInsurance.count({ where: { verificationStatus: 'PENDING' } }),
    prisma.supportCase.count({ where: { status: { in: ['OPEN', 'IN_PROGRESS'] } } }),
    prisma.payment.aggregate({ where: { status: 'PAID', paidAt: { gte: thisMonth } }, _sum: { amount: true } }),
    prisma.appointment.count({ where: { status: 'COMPLETED', completedAt: { gte: thisMonth } } }),
    prisma.doctorPayout.aggregate({ where: { status: 'PENDING' }, _sum: { netAmount: true } }),
  ]);

  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  const recentAppts = await prisma.appointment.findMany({
    where: { appointmentDate: { gte: sevenDaysAgo, lte: today } },
    select: { appointmentDate: true },
  });
  const appointmentData = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const count = recentAppts.filter(a => {
      if (!a.appointmentDate) return false;
      return a.appointmentDate.toISOString().split('T')[0] === dateStr;
    }).length;
    appointmentData.push({ periodStart: dateStr, count });
  }

  const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 5, 1);
  const recentPayments = await prisma.payment.findMany({
    where: { status: 'PAID', paidAt: { gte: sixMonthsAgo } },
    select: { paidAt: true, amount: true },
  });
  const revenueData = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const periodStart = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
    const sum = recentPayments
      .filter(p => p.paidAt && p.paidAt.getFullYear() === d.getFullYear() && p.paidAt.getMonth() === d.getMonth())
      .reduce((acc, curr) => acc + Number(curr.amount), 0);
    revenueData.push({ periodStart, amount: sum });
  }

  return successResponse(res, {
    data: {
      totalPatients,
      totalDoctors,
      totalAppointments,
      todayAppointments,
      pendingVerifications,
      openInsuranceCases,
      insuranceApprovedToday,
      pendingInsurancePolicies,
      openSupportCases,
      monthlyRevenue: monthlyRevenue._sum.amount || 0,
      completedThisMonth: completedAppointments,
      pendingPayouts: pendingPayouts._sum.netAmount || 0,
      appointmentData,
      revenueData,
    },
  });
}));

module.exports = router;

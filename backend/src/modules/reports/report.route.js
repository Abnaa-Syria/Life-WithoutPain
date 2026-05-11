const router = require('express').Router();
const { authenticate, authorize } = require('../../middlewares/auth');
const { asyncHandler } = require('../../utils/helpers');
const { successResponse, createdResponse, paginatedResponse } = require('../../shared/responses');
const { buildPagination } = require('../../utils/pagination');
const prisma = require('../../config/database');
const { ROLES } = require('../../constants');
const { NotFoundError } = require('../../shared/errors/AppError');
const PdfGenerator = require('../../shared/pdf/PdfGenerator');

router.use(authenticate);

router.post('/', authorize(ROLES.DOCTOR), asyncHandler(async (req, res) => {
  const report = await prisma.medicalReport.create({ data: req.body });
  const pdfUrl = await PdfGenerator.generateReport(report);
  const data = await prisma.medicalReport.update({ where: { id: report.id }, data: { pdfUrl } });
  return createdResponse(res, { data });
}));

router.get('/', asyncHandler(async (req, res) => {
  const { page, limit, skip } = buildPagination(req.query);
  const where = {};
  if (req.query.patientId) where.patientId = parseInt(req.query.patientId);
  if (req.query.doctorId) where.doctorId = parseInt(req.query.doctorId);

  const [data, total] = await Promise.all([
    prisma.medicalReport.findMany({
      where, skip, take: limit, orderBy: { createdAt: 'desc' },
      include: {
        patient: { include: { user: { select: { fullName: true } } } },
        doctor: { include: { user: { select: { fullName: true } } } },
      },
    }),
    prisma.medicalReport.count({ where }),
  ]);
  return paginatedResponse(res, { data, total, page, limit });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const data = await prisma.medicalReport.findUnique({
    where: { id: parseInt(req.params.id) },
    include: {
      patient: { include: { user: { select: { fullName: true } } } },
      doctor: { include: { user: { select: { fullName: true } }, speciality: true } },
      appointment: true,
    },
  });
  if (!data) throw new NotFoundError('Report not found');
  return successResponse(res, { data });
}));

router.put('/:id', authorize(ROLES.DOCTOR), asyncHandler(async (req, res) => {
  const data = await prisma.medicalReport.update({ where: { id: parseInt(req.params.id) }, data: req.body });
  return successResponse(res, { data });
}));

router.get('/:id/pdf', asyncHandler(async (req, res) => {
  const report = await prisma.medicalReport.findUnique({ where: { id: parseInt(req.params.id) } });
  if (!report) throw new NotFoundError('Report not found');
  return successResponse(res, { data: { pdfUrl: report.pdfUrl } });
}));

module.exports = router;

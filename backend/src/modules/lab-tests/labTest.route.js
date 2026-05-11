const router = require('express').Router();
const { authenticate, authorize } = require('../../middlewares/auth');
const { asyncHandler } = require('../../utils/helpers');
const { successResponse, createdResponse, paginatedResponse } = require('../../shared/responses');
const { buildPagination } = require('../../utils/pagination');
const { uploadSingle } = require('../../middlewares/upload');
const prisma = require('../../config/database');
const { ROLES } = require('../../constants');
const { NotFoundError } = require('../../shared/errors/AppError');

router.use(authenticate);

router.post('/', authorize(ROLES.DOCTOR), asyncHandler(async (req, res) => {
  const data = await prisma.labTestRequest.create({
    data: {
      appointmentId: req.body.appointmentId,
      patientId: req.body.patientId,
      doctorId: req.body.doctorId,
      title: req.body.title,
      notes: req.body.notes,
    },
  });
  return createdResponse(res, { data });
}));

router.get('/', asyncHandler(async (req, res) => {
  const { page, limit, skip } = buildPagination(req.query);
  const where = {};
  if (req.query.patientId) where.patientId = parseInt(req.query.patientId);
  if (req.query.doctorId) where.doctorId = parseInt(req.query.doctorId);
  if (req.query.status) where.status = req.query.status;

  const [data, total] = await Promise.all([
    prisma.labTestRequest.findMany({
      where, skip, take: limit, orderBy: { requestedAt: 'desc' },
      include: {
        patient: { include: { user: { select: { fullName: true } } } },
        doctor: { include: { user: { select: { fullName: true } } } },
        results: true,
      },
    }),
    prisma.labTestRequest.count({ where }),
  ]);
  return paginatedResponse(res, { data, total, page, limit });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const data = await prisma.labTestRequest.findUnique({
    where: { id: parseInt(req.params.id) },
    include: { results: true, patient: { include: { user: { select: { fullName: true } } } }, doctor: { include: { user: { select: { fullName: true } } } } },
  });
  if (!data) throw new NotFoundError('Lab test not found');
  return successResponse(res, { data });
}));

router.patch('/:id/status', asyncHandler(async (req, res) => {
  const data = await prisma.labTestRequest.update({
    where: { id: parseInt(req.params.id) },
    data: { status: req.body.status },
  });
  return successResponse(res, { data });
}));

router.post('/:id/results', uploadSingle('file'), asyncHandler(async (req, res) => {
  const data = await prisma.labResult.create({
    data: {
      labTestRequestId: parseInt(req.params.id),
      uploadedBy: req.user.id,
      fileUrl: req.file ? `/uploads/${req.file.filename}` : req.body.fileUrl,
      notes: req.body.notes,
    },
  });
  await prisma.labTestRequest.update({ where: { id: parseInt(req.params.id) }, data: { status: 'COMPLETED' } });
  return createdResponse(res, { data });
}));

router.get('/:id/results', asyncHandler(async (req, res) => {
  const data = await prisma.labResult.findMany({
    where: { labTestRequestId: parseInt(req.params.id) },
    orderBy: { createdAt: 'desc' },
  });
  return successResponse(res, { data });
}));

module.exports = router;

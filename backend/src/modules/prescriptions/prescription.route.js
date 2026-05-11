const router = require('express').Router();
const { authenticate, authorize } = require('../../middlewares/auth');
const { asyncHandler } = require('../../utils/helpers');
const { successResponse, createdResponse, paginatedResponse } = require('../../shared/responses');
const { buildPagination } = require('../../utils/pagination');
const prisma = require('../../config/database');
const { ROLES } = require('../../constants');
const { NotFoundError } = require('../../shared/errors/AppError');
const PdfGenerator = require('../../shared/pdf/PdfGenerator');
const QRCode = require('qrcode');

router.use(authenticate);

router.post('/', authorize(ROLES.DOCTOR), asyncHandler(async (req, res) => {
  const { items, ...prescriptionData } = req.body;
  const qrValue = `RX-${Date.now()}-${prescriptionData.doctorId}`;

  let qrCodeValue;
  try { qrCodeValue = await QRCode.toDataURL(qrValue); } catch { qrCodeValue = qrValue; }

  const prescription = await prisma.prescription.create({
    data: {
      ...prescriptionData,
      qrCodeValue,
      digitalSealValue: `SEAL-${Date.now()}`,
      items: items ? { create: items } : undefined,
    },
    include: { items: true },
  });

  const pdfUrl = await PdfGenerator.generatePrescription(prescription);
  const data = await prisma.prescription.update({ where: { id: prescription.id }, data: { pdfUrl }, include: { items: true } });
  return createdResponse(res, { data });
}));

router.get('/', asyncHandler(async (req, res) => {
  const { page, limit, skip } = buildPagination(req.query);
  const where = {};
  if (req.query.patientId) where.patientId = parseInt(req.query.patientId);
  if (req.query.doctorId) where.doctorId = parseInt(req.query.doctorId);

  const [data, total] = await Promise.all([
    prisma.prescription.findMany({
      where, skip, take: limit, orderBy: { createdAt: 'desc' },
      include: {
        patient: { include: { user: { select: { fullName: true } } } },
        doctor: { include: { user: { select: { fullName: true } } } },
        items: true,
      },
    }),
    prisma.prescription.count({ where }),
  ]);
  return paginatedResponse(res, { data, total, page, limit });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const data = await prisma.prescription.findUnique({
    where: { id: parseInt(req.params.id) },
    include: {
      items: true,
      patient: { include: { user: { select: { fullName: true } } } },
      doctor: { include: { user: { select: { fullName: true } }, speciality: true } },
    },
  });
  if (!data) throw new NotFoundError('Prescription not found');
  return successResponse(res, { data });
}));

router.put('/:id', authorize(ROLES.DOCTOR), asyncHandler(async (req, res) => {
  const { items, ...updateData } = req.body;
  const data = await prisma.prescription.update({ where: { id: parseInt(req.params.id) }, data: updateData, include: { items: true } });
  return successResponse(res, { data });
}));

router.get('/:id/pdf', asyncHandler(async (req, res) => {
  const rx = await prisma.prescription.findUnique({ where: { id: parseInt(req.params.id) } });
  if (!rx) throw new NotFoundError('Prescription not found');
  return successResponse(res, { data: { pdfUrl: rx.pdfUrl } });
}));

router.get('/:id/qr', asyncHandler(async (req, res) => {
  const rx = await prisma.prescription.findUnique({ where: { id: parseInt(req.params.id) } });
  if (!rx) throw new NotFoundError('Prescription not found');
  return successResponse(res, { data: { qrCodeValue: rx.qrCodeValue } });
}));

module.exports = router;

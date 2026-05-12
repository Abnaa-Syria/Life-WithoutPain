const PrescriptionRepository = require('./prescription.repository');
const { NotFoundError } = require('../../shared/errors/AppError');
const { buildPagination } = require('../../utils/pagination');
const PdfGenerator = require('../../shared/pdf/PdfGenerator');
const QRCode = require('qrcode');

class PrescriptionService {
  static async create(body) {
    const { items, ...prescriptionData } = body;
    const qrValue = `RX-${Date.now()}-${prescriptionData.doctorId}`;

    let qrCodeValue;
    try { qrCodeValue = await QRCode.toDataURL(qrValue); } catch { qrCodeValue = qrValue; }

    const prescription = await PrescriptionRepository.create({
      data: {
        ...prescriptionData,
        qrCodeValue,
        digitalSealValue: `SEAL-${Date.now()}`,
        items: items ? { create: items } : undefined,
      },
      include: { items: true },
    });

    const pdfUrl = await PdfGenerator.generatePrescription(prescription);
    return PrescriptionRepository.update({ where: { id: prescription.id }, data: { pdfUrl }, include: { items: true } });
  }

  static async list(query) {
    const { page, limit, skip } = buildPagination(query);
    const where = {};
    if (query.patientId) where.patientId = parseInt(query.patientId);
    if (query.doctorId) where.doctorId = parseInt(query.doctorId);

    const [data, total] = await Promise.all([
      PrescriptionRepository.findMany({
        where, skip, take: limit, orderBy: { createdAt: 'desc' },
        include: {
          patient: { include: { user: { select: { fullName: true } } } },
          doctor: { include: { user: { select: { fullName: true } } } },
          items: true,
        },
      }),
      PrescriptionRepository.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  static async getById(id) {
    const data = await PrescriptionRepository.findUnique({
      where: { id: parseInt(id) },
      include: {
        items: true,
        patient: { include: { user: { select: { fullName: true } } } },
        doctor: { include: { user: { select: { fullName: true } }, speciality: true } },
      },
    });
    if (!data) throw new NotFoundError('Prescription not found');
    return data;
  }

  static async update(id, body) {
    const { items, ...updateData } = body;
    return PrescriptionRepository.update({ where: { id: parseInt(id) }, data: updateData, include: { items: true } });
  }

  static async getPdf(id) {
    const rx = await PrescriptionRepository.findUnique({ where: { id: parseInt(id) } });
    if (!rx) throw new NotFoundError('Prescription not found');
    return rx.pdfUrl;
  }

  static async getQr(id) {
    const rx = await PrescriptionRepository.findUnique({ where: { id: parseInt(id) } });
    if (!rx) throw new NotFoundError('Prescription not found');
    return rx.qrCodeValue;
  }
}

module.exports = PrescriptionService;

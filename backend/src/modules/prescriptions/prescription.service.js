const prisma = require('../../config/database');
const PrescriptionRepository = require('./prescription.repository');
const { enrichRecordsWithDoctorSpeciality } = require('../../i18n/enrichRelations');
const { NotFoundError } = require('../../shared/errors/AppError');
const { buildPagination } = require('../../utils/pagination');
const {
  resolveDoctorProfile,
  assertDoctorOwnsPrescription,
  resolveDoctorAppointmentContext,
  assertDoctorHasPatient,
} = require('../../shared/utils/doctorAppContext');
const { BadRequestError } = require('../../shared/errors/AppError');
const PdfGenerator = require('../../shared/pdf/PdfGenerator');
const QRCode = require('qrcode');
const { eventEmitter, EVENTS } = require('../../shared/events/eventEmitter');

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
    const saved = await PrescriptionRepository.update({
      where: { id: prescription.id },
      data: { pdfUrl },
      include: {
        items: true,
        patient: { select: { userId: true } },
      },
    });
    eventEmitter.emit(EVENTS.PRESCRIPTION.CREATED, saved);
    return saved;
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
          doctor: { include: { user: { select: { fullName: true } }, speciality: true } },
          appointment: true,
          items: true,
        },
      }),
      PrescriptionRepository.count({ where }),
    ]);
    return { data: await enrichRecordsWithDoctorSpeciality(data), total, page, limit };
  }

  static async getById(id) {
    const data = await PrescriptionRepository.findUnique({
      where: { id: parseInt(id) },
      include: {
        items: true,
        patient: { include: { user: { select: { fullName: true } } } },
        doctor: { include: { user: { select: { fullName: true } }, speciality: true } },
        appointment: true,
      },
    });
    if (!data) throw new NotFoundError('PRESCRIPTION_NOT_FOUND');
    return enrichRecordsWithDoctorSpeciality(data);
  }

  static async getPdfForPatient(userId, id) {
    const patient = await prisma.patientProfile.findUnique({ where: { userId } });
    if (!patient) throw new NotFoundError('PATIENT_PROFILE_NOT_FOUND');
    const { assertPatientOwnsPrescription } = require('../../shared/utils/patientAppContext');
    await assertPatientOwnsPrescription(patient.id, id);
    return this.getPdf(id);
  }

  static async update(id, body) {
    const { items, ...updateData } = body;
    return PrescriptionRepository.update({ where: { id: parseInt(id) }, data: updateData, include: { items: true } });
  }

  static async getPdf(id) {
    const rx = await PrescriptionRepository.findUnique({ where: { id: parseInt(id) } });
    if (!rx) throw new NotFoundError('PRESCRIPTION_NOT_FOUND');
    return rx.pdfUrl;
  }

  static async getQr(id) {
    const rx = await PrescriptionRepository.findUnique({ where: { id: parseInt(id) } });
    if (!rx) throw new NotFoundError('PRESCRIPTION_NOT_FOUND');
    return rx.qrCodeValue;
  }

  static async listForDoctor(userId, query) {
    const { doctorId } = await resolveDoctorProfile(userId);
    return this.list({ ...query, doctorId });
  }

  static async getByIdForDoctor(userId, id) {
    const { doctorId } = await resolveDoctorProfile(userId);
    await assertDoctorOwnsPrescription(doctorId, id);
    return this.getById(id);
  }

  static async createForDoctor(userId, body) {
    const { doctorId } = await resolveDoctorProfile(userId);
    const { patientId, appointmentId } = await resolveDoctorAppointmentContext(doctorId, body);

    const parsedPatientId = parseInt(body.patientId, 10);
    if (Number.isFinite(parsedPatientId) && parsedPatientId !== patientId) {
      await assertDoctorHasPatient(doctorId, patientId);
    }

    const diagnosis =
      body.diagnosis
      || body.prescriptionData
      || body.notes
      || 'General prescription';

    const items = body.medications?.map((m) => ({
      medicineName: m.medicineName || m.name,
      dosage: m.dosage || '—',
      frequency: m.frequency || '—',
      duration: m.duration || '—',
      instructions: m.timing || m.instructions || null,
    })) || body.items;

    if (!items?.length) {
      throw new BadRequestError('PRESCRIPTION_ITEMS_REQUIRED');
    }

    return this.create({
      appointmentId,
      patientId,
      doctorId,
      diagnosis: String(diagnosis),
      items,
      notes: body.sideEffectsNotes || body.notes || null,
    });
  }

  static async getPdfForDoctor(userId, id) {
    const { doctorId } = await resolveDoctorProfile(userId);
    await assertDoctorOwnsPrescription(doctorId, id);
    return this.getPdf(id);
  }
}

module.exports = PrescriptionService;

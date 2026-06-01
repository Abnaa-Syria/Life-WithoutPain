const MedicalReportRepository = require('./report.repository');
const { NotFoundError } = require('../../shared/errors/AppError');
const { buildPagination } = require('../../utils/pagination');
const { resolveDoctorProfile, assertDoctorOwnsReport } = require('../../shared/utils/doctorAppContext');
const PdfGenerator = require('../../shared/pdf/PdfGenerator');
const { eventEmitter, EVENTS } = require('../../shared/events/eventEmitter');

class ReportService {
  static async create(body) {
    const report = await MedicalReportRepository.create({ data: body });
    const pdfUrl = await PdfGenerator.generateReport(report);
    const saved = await MedicalReportRepository.update({
      where: { id: report.id },
      data: { pdfUrl },
      include: { patient: { select: { userId: true } } },
    });
    eventEmitter.emit(EVENTS.REPORT.CREATED, saved);
    return saved;
  }

  static async list(query) {
    const { page, limit, skip } = buildPagination(query);
    const where = {};
    if (query.patientId) where.patientId = parseInt(query.patientId);
    if (query.doctorId) where.doctorId = parseInt(query.doctorId);

    const [data, total] = await Promise.all([
      MedicalReportRepository.findMany({
        where, skip, take: limit, orderBy: { createdAt: 'desc' },
        include: {
          patient: { include: { user: { select: { fullName: true } } } },
          doctor: { include: { user: { select: { fullName: true } } } },
          attachments: true,
        },
      }),
      MedicalReportRepository.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  static async getById(id) {
    const data = await MedicalReportRepository.findUnique({
      where: { id: parseInt(id) },
      include: {
        patient: { include: { user: { select: { fullName: true } } } },
        doctor: { include: { user: { select: { fullName: true } }, speciality: true } },
        appointment: true,
        attachments: true,
      },
    });
    if (!data) throw new NotFoundError('Report not found');
    return data;
  }

  static async update(id, body) {
    return MedicalReportRepository.update({ where: { id: parseInt(id) }, data: body });
  }

  static async getPdf(id) {
    const report = await MedicalReportRepository.findUnique({ where: { id: parseInt(id) } });
    if (!report) throw new NotFoundError('Report not found');
    return report.pdfUrl;
  }

  static async listForDoctor(userId, query) {
    const { doctorId } = await resolveDoctorProfile(userId);
    return this.list({ ...query, doctorId });
  }

  static async getByIdForDoctor(userId, id) {
    const { doctorId } = await resolveDoctorProfile(userId);
    await assertDoctorOwnsReport(doctorId, id);
    return this.getById(id);
  }

  static async createForDoctor(userId, body) {
    const { doctorId } = await resolveDoctorProfile(userId);
    const { doctorId: _omit, tests, clinicalExamination, ...rest } = body;

    return this.create({
      patientId: rest.patientId,
      appointmentId: rest.appointmentId,
      doctorId,
      visitReason: rest.visitReason,
      symptoms: rest.symptoms,
      clinicalFindings: clinicalExamination || rest.clinicalFindings,
      clinicalExam: tests || rest.clinicalExam,
      nextAppointmentDate: rest.nextAppointmentDate ? new Date(rest.nextAppointmentDate) : undefined,
      diagnosis: rest.diagnosis || rest.visitReason,
      summary: rest.summary,
    });
  }

  static async getPdfForDoctor(userId, id) {
    const { doctorId } = await resolveDoctorProfile(userId);
    await assertDoctorOwnsReport(doctorId, id);
    return this.getPdf(id);
  }
}

module.exports = ReportService;

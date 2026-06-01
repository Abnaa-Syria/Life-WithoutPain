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
          prescription: { select: { id: true } },
          attachments: true,
        },
      }),
      MedicalReportRepository.count({ where }),
    ]);
    
    const formattedData = data.map(report => ({
      ...report,
      prescriptionNumber: report.prescription ? `RX-${report.prescription.id}` : null,
    }));
    
    return { data: formattedData, total, page, limit };
  }

  static async getById(id) {
    const data = await MedicalReportRepository.findUnique({
      where: { id: parseInt(id) },
      include: {
        patient: { include: { user: { select: { fullName: true } } } },
        doctor: { include: { user: { select: { fullName: true } }, speciality: true } },
        appointment: true,
        prescription: { select: { id: true } },
        attachments: true,
      },
    });
    if (!data) throw new NotFoundError('Report not found');
    
    return {
      ...data,
      prescriptionNumber: data.prescription ? `RX-${data.prescription.id}` : null,
    };
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
    const { doctorId: _omit, tests, clinicalExamination, attachments, ...rest } = body;

    const reportData = {
      patientId: rest.patientId,
      appointmentId: rest.appointmentId,
      doctorId,
      prescriptionId: rest.prescriptionId,
      visitReason: rest.visitReason,
      symptoms: rest.symptoms,
      clinicalFindings: rest.clinicalFindings,
      clinicalExam: clinicalExamination || rest.clinicalExam,
      resultSummary: rest.resultSummary,
      resultsList: rest.resultsList,
      nextAppointmentDate: rest.nextAppointmentDate ? new Date(rest.nextAppointmentDate) : undefined,
      diagnosis: rest.diagnosis || rest.visitReason,
      summary: rest.summary,
    };

    if (attachments && Array.isArray(attachments)) {
      reportData.attachments = {
        create: attachments.map(url => ({ fileUrl: url, type: 'DOCUMENT' }))
      };
    }

    return this.create(reportData);
  }

  static async getPdfForDoctor(userId, id) {
    const { doctorId } = await resolveDoctorProfile(userId);
    await assertDoctorOwnsReport(doctorId, id);
    return this.getPdf(id);
  }
}

module.exports = ReportService;

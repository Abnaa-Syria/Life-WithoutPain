const MedicalReportRepository = require('./report.repository');
const { NotFoundError } = require('../../shared/errors/AppError');
const { buildPagination } = require('../../utils/pagination');
const PdfGenerator = require('../../shared/pdf/PdfGenerator');

class ReportService {
  static async create(body) {
    const report = await MedicalReportRepository.create({ data: body });
    const pdfUrl = await PdfGenerator.generateReport(report);
    return MedicalReportRepository.update({ where: { id: report.id }, data: { pdfUrl } });
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
}

module.exports = ReportService;

const LabTestRepository = require('./labTest.repository');
const LabResultRepository = require('./labResult.repository');
const { NotFoundError } = require('../../shared/errors/AppError');
const { buildPagination } = require('../../utils/pagination');

class LabTestService {
  static async create(body) {
    return LabTestRepository.create({
      data: {
        appointmentId: body.appointmentId,
        patientId: body.patientId,
        doctorId: body.doctorId,
        title: body.title,
        notes: body.notes,
      },
    });
  }

  static async list(query) {
    const { page, limit, skip } = buildPagination(query);
    const where = {};
    if (query.patientId) where.patientId = parseInt(query.patientId);
    if (query.doctorId) where.doctorId = parseInt(query.doctorId);
    if (query.status) where.status = query.status;

    const [data, total] = await Promise.all([
      LabTestRepository.findMany({
        where, skip, take: limit, orderBy: { requestedAt: 'desc' },
        include: {
          patient: { include: { user: { select: { fullName: true } } } },
          doctor: { include: { user: { select: { fullName: true } } } },
          results: true,
        },
      }),
      LabTestRepository.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  static async getById(id) {
    const data = await LabTestRepository.findUnique({
      where: { id: parseInt(id) },
      include: {
        results: true,
        patient: { include: { user: { select: { fullName: true } } } },
        doctor: { include: { user: { select: { fullName: true } } } },
      },
    });
    if (!data) throw new NotFoundError('Lab test not found');
    return data;
  }

  static async updateStatus(id, status) {
    return LabTestRepository.update({ where: { id: parseInt(id) }, data: { status } });
  }

  static async uploadResult(labTestRequestId, uploadedBy, fileUrl, notes) {
    const result = await LabResultRepository.create({
      data: { labTestRequestId: parseInt(labTestRequestId), uploadedBy, fileUrl, notes },
    });
    await LabTestRepository.update({ where: { id: parseInt(labTestRequestId) }, data: { status: 'COMPLETED' } });
    return result;
  }

  static async getResults(labTestRequestId) {
    return LabResultRepository.findMany({
      where: { labTestRequestId: parseInt(labTestRequestId) },
      orderBy: { createdAt: 'desc' },
    });
  }
}

module.exports = LabTestService;

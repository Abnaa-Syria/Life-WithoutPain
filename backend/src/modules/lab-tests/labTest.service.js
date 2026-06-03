const prisma = require('../../config/database');
const LabTestRepository = require('./labTest.repository');
const LabResultRepository = require('./labResult.repository');
const { NotFoundError, BadRequestError, ForbiddenError } = require('../../shared/errors/AppError');
const { buildPagination } = require('../../utils/pagination');
const { eventEmitter, EVENTS } = require('../../shared/events/eventEmitter');
const { resolveDoctorProfile, assertDoctorOwnsAppointment } = require('../../shared/utils/doctorAppContext');

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
    const normalized = String(status || '').trim().toUpperCase();
    const allowed = ['REQUESTED', 'SAMPLE_COLLECTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
    if (!allowed.includes(normalized)) {
      throw new BadRequestError(`Invalid lab test status: ${status}`);
    }
    return LabTestRepository.update({ where: { id: parseInt(id) }, data: { status: normalized } });
  }

  static async resolveDoctorLabTestContext(doctorId, body) {
    let patientId = parseInt(body.patientId, 10);
    let appointmentId = parseInt(body.appointmentId, 10);

    if (!Number.isFinite(patientId) || !Number.isFinite(appointmentId)) {
      const where = { doctorId };
      if (Number.isFinite(patientId)) where.patientId = patientId;
      const appointment = await prisma.appointment.findFirst({
        where,
        orderBy: [{ appointmentDate: 'desc' }, { id: 'desc' }],
      });
      if (!appointment) {
        throw new BadRequestError('No appointment found for this doctor to attach the lab test');
      }
      patientId = appointment.patientId;
      appointmentId = appointment.id;
    }

    await assertDoctorOwnsAppointment(doctorId, appointmentId);
    return { patientId, appointmentId };
  }

  static async createForDoctor(userId, body) {
    const { doctorId } = await resolveDoctorProfile(userId);
    const { patientId, appointmentId } = await this.resolveDoctorLabTestContext(doctorId, body);
    const tests = body.tests;
    const title =
      body.title
      || (Array.isArray(tests) && tests.length ? tests.join(', ') : null)
      || 'Lab test request';

    return this.create({
      appointmentId,
      patientId,
      doctorId,
      title: String(title).slice(0, 255),
      notes: body.notes || null,
    });
  }

  static async listForDoctor(userId, query) {
    const { doctorId } = await resolveDoctorProfile(userId);
    return this.list({ ...query, doctorId });
  }

  static async getByIdForDoctor(userId, id) {
    const { doctorId } = await resolveDoctorProfile(userId);
    const labTest = await this.getById(id);
    if (labTest.doctorId !== doctorId) {
      throw new ForbiddenError('You do not have access to this lab test');
    }
    return labTest;
  }

  static async updateStatusForDoctor(userId, id, status) {
    const { doctorId } = await resolveDoctorProfile(userId);
    const labTest = await this.getById(id);
    if (labTest.doctorId !== doctorId) {
      throw new ForbiddenError('You do not have access to this lab test');
    }
    return this.updateStatus(id, status);
  }

  static async uploadResultForDoctor(userId, labTestRequestId, fileUrl, notes) {
    const { doctorId } = await resolveDoctorProfile(userId);
    const labTest = await this.getById(labTestRequestId);
    if (labTest.doctorId !== doctorId) {
      throw new ForbiddenError('You do not have access to this lab test');
    }
    return this.uploadResult(labTestRequestId, userId, fileUrl, notes);
  }

  static async getResultsForDoctor(userId, labTestRequestId) {
    const { doctorId } = await resolveDoctorProfile(userId);
    const labTest = await this.getById(labTestRequestId);
    if (labTest.doctorId !== doctorId) {
      throw new ForbiddenError('You do not have access to this lab test');
    }
    return this.getResults(labTestRequestId);
  }

  static async uploadResult(labTestRequestId, uploadedBy, fileUrl, notes) {
    const result = await LabResultRepository.create({
      data: { labTestRequestId: parseInt(labTestRequestId), uploadedBy, fileUrl, notes },
    });
    await LabTestRepository.update({ where: { id: parseInt(labTestRequestId) }, data: { status: 'COMPLETED' } });
    const labTest = await LabTestRepository.findUnique({
      where: { id: parseInt(labTestRequestId) },
      include: { patient: { select: { userId: true } } },
    });
    eventEmitter.emit(EVENTS.LAB_RESULT.CREATED, { labTest, result });
    return result;
  }

  static async getResults(labTestRequestId) {
    return LabResultRepository.findMany({
      where: { labTestRequestId: parseInt(labTestRequestId) },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getPdfForPatient(labTestRequestId) {
    const results = await this.getResults(labTestRequestId);
    const latest = results.find((r) => r.fileUrl);
    if (!latest?.fileUrl) throw new NotFoundError('Lab test PDF not available');
    return latest.fileUrl;
  }
}

module.exports = LabTestService;

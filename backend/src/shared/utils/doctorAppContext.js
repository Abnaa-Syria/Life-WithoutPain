const prisma = require('../../config/database');
const { NotFoundError, ForbiddenError, BadRequestError } = require('../errors/AppError');

async function resolveDoctorProfile(userId) {
  const profile = await prisma.doctorProfile.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          avatarUrl: true,
          preferredLanguage: true,
          darkModeEnabled: true,
          status: true,
        },
      },
      speciality: true,
    },
  });
  if (!profile) throw new NotFoundError('Doctor profile not found');
  return { doctorId: profile.id, profile };
}

async function assertDoctorOwnsAppointment(doctorId, appointmentId) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: parseInt(appointmentId) },
  });
  if (!appointment) throw new NotFoundError('Appointment not found');
  if (appointment.doctorId !== doctorId) {
    throw new ForbiddenError('You do not have access to this appointment');
  }
  return appointment;
}

async function assertDoctorOwnsPrescription(doctorId, prescriptionId) {
  const rx = await prisma.prescription.findUnique({ where: { id: parseInt(prescriptionId) } });
  if (!rx) throw new NotFoundError('Prescription not found');
  if (rx.doctorId !== doctorId) {
    throw new ForbiddenError('You do not have access to this prescription');
  }
  return rx;
}

async function assertDoctorOwnsReport(doctorId, reportId) {
  const report = await prisma.medicalReport.findUnique({ where: { id: parseInt(reportId) } });
  if (!report) throw new NotFoundError('Report not found');
  if (report.doctorId !== doctorId) {
    throw new ForbiddenError('You do not have access to this report');
  }
  return report;
}

async function assertDoctorHasPatient(doctorId, patientId) {
  const link = await prisma.appointment.findFirst({
    where: { doctorId, patientId: parseInt(patientId, 10) },
  });
  if (!link) throw new ForbiddenError('You do not have access to this patient');
}

async function resolveDoctorAppointmentContext(doctorId, body) {
  let patientId = parseInt(body.patientId, 10);
  let appointmentId = parseInt(body.appointmentId, 10);

  if (!Number.isFinite(patientId) && body.patientEmail) {
    const patient = await prisma.patientProfile.findFirst({
      where: { user: { email: String(body.patientEmail).trim(), deletedAt: null } },
      select: { id: true },
    });
    if (patient) patientId = patient.id;
  }

  if (!Number.isFinite(patientId) || !Number.isFinite(appointmentId)) {
    const where = { doctorId, notes: 'Mobile demo appointment' };
    if (Number.isFinite(patientId)) where.patientId = patientId;
    let appointment = await prisma.appointment.findFirst({
      where,
      orderBy: [{ appointmentDate: 'desc' }, { id: 'desc' }],
    });
    if (!appointment) {
      delete where.notes;
      appointment = await prisma.appointment.findFirst({
        where,
        orderBy: [{ appointmentDate: 'desc' }, { id: 'desc' }],
      });
    }
    if (!appointment) {
      throw new BadRequestError('No appointment found for this doctor to attach the record');
    }
    patientId = appointment.patientId;
    appointmentId = appointment.id;
  }

  const appointment = await prisma.appointment.findFirst({
    where: { id: appointmentId, doctorId, patientId },
  });
  if (!appointment) {
    throw new BadRequestError('Appointment not found for this doctor and patient');
  }

  return { patientId, appointmentId, appointment };
}

module.exports = {
  resolveDoctorProfile,
  assertDoctorOwnsAppointment,
  assertDoctorOwnsPrescription,
  assertDoctorOwnsReport,
  assertDoctorHasPatient,
  resolveDoctorAppointmentContext,
};

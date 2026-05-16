const prisma = require('../../config/database');
const { NotFoundError, ForbiddenError } = require('../errors/AppError');

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
    where: { doctorId, patientId: parseInt(patientId) },
  });
  if (!link) throw new ForbiddenError('You do not have access to this patient');
}

module.exports = {
  resolveDoctorProfile,
  assertDoctorOwnsAppointment,
  assertDoctorOwnsPrescription,
  assertDoctorOwnsReport,
  assertDoctorHasPatient,
};

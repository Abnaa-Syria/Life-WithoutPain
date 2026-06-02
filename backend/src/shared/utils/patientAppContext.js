const prisma = require('../../config/database');
const { NotFoundError, ForbiddenError } = require('../errors/AppError');

async function resolvePatientProfile(userId) {
  const profile = await prisma.patientProfile.findUnique({
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
    },
  });
  if (!profile) throw new NotFoundError('Patient profile not found');
  return { patientId: profile.id, profile };
}

async function assertPatientOwnsAppointment(patientId, appointmentId) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: parseInt(appointmentId, 10) },
  });
  if (!appointment) throw new NotFoundError('Appointment not found');
  if (appointment.patientId !== patientId) {
    throw new ForbiddenError('You do not have access to this appointment');
  }
  return appointment;
}

async function assertPatientOwnsPrescription(patientId, prescriptionId) {
  const rx = await prisma.prescription.findUnique({ where: { id: parseInt(prescriptionId, 10) } });
  if (!rx) throw new NotFoundError('Prescription not found');
  if (rx.patientId !== patientId) throw new ForbiddenError('You do not have access to this prescription');
  return rx;
}

async function assertPatientOwnsReport(patientId, reportId) {
  const report = await prisma.medicalReport.findUnique({ where: { id: parseInt(reportId, 10) } });
  if (!report) throw new NotFoundError('Report not found');
  if (report.patientId !== patientId) throw new ForbiddenError('You do not have access to this report');
  return report;
}

async function assertPatientOwnsLabTest(patientId, labTestId) {
  const labTest = await prisma.labTestRequest.findUnique({ where: { id: parseInt(labTestId, 10) } });
  if (!labTest) throw new NotFoundError('Lab test not found');
  if (labTest.patientId !== patientId) throw new ForbiddenError('You do not have access to this lab test');
  return labTest;
}

async function assertPatientOwnsMedicalFile(patientId, fileId) {
  const file = await prisma.medicalFile.findFirst({
    where: { id: parseInt(fileId, 10), patientId, category: 'RADIOLOGY' },
  });
  if (!file) throw new NotFoundError('X-ray record not found');
  return file;
}

module.exports = {
  resolvePatientProfile,
  assertPatientOwnsAppointment,
  assertPatientOwnsPrescription,
  assertPatientOwnsReport,
  assertPatientOwnsLabTest,
  assertPatientOwnsMedicalFile,
};

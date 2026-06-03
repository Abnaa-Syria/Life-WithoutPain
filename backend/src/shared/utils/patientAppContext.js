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
  if (!profile) throw new NotFoundError('PATIENT_PROFILE_NOT_FOUND');
  return { patientId: profile.id, profile };
}

async function assertPatientOwnsAppointment(patientId, appointmentId) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: parseInt(appointmentId, 10) },
  });
  if (!appointment) throw new NotFoundError('APPOINTMENT_NOT_FOUND');
  if (appointment.patientId !== patientId) {
    throw new ForbiddenError('APPOINTMENT_ACCESS_DENIED');
  }
  return appointment;
}

async function assertPatientOwnsPrescription(patientId, prescriptionId) {
  const rx = await prisma.prescription.findUnique({ where: { id: parseInt(prescriptionId, 10) } });
  if (!rx) throw new NotFoundError('PRESCRIPTION_NOT_FOUND');
  if (rx.patientId !== patientId) throw new ForbiddenError('PRESCRIPTION_ACCESS_DENIED');
  return rx;
}

async function assertPatientOwnsReport(patientId, reportId) {
  const report = await prisma.medicalReport.findUnique({ where: { id: parseInt(reportId, 10) } });
  if (!report) throw new NotFoundError('REPORT_NOT_FOUND');
  if (report.patientId !== patientId) throw new ForbiddenError('REPORT_ACCESS_DENIED');
  return report;
}

async function assertPatientOwnsLabTest(patientId, labTestId) {
  const labTest = await prisma.labTestRequest.findUnique({ where: { id: parseInt(labTestId, 10) } });
  if (!labTest) throw new NotFoundError('LAB_TEST_NOT_FOUND');
  if (labTest.patientId !== patientId) throw new ForbiddenError('LAB_TEST_ACCESS_DENIED');
  return labTest;
}

async function assertPatientOwnsMedicalFile(patientId, fileId) {
  const file = await prisma.medicalFile.findFirst({
    where: { id: parseInt(fileId, 10), patientId, category: 'RADIOLOGY' },
  });
  if (!file) throw new NotFoundError('XRAY_NOT_FOUND');
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

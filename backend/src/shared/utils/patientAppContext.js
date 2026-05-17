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

module.exports = {
  resolvePatientProfile,
  assertPatientOwnsAppointment,
};

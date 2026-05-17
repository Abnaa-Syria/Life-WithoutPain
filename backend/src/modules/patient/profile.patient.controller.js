const prisma = require('../../config/database');
const PatientService = require('../patients/patient.service');
const { successResponse } = require('../../shared/responses');
const { asyncHandler } = require('../../utils/helpers');
const { mapPatientProfile } = require('../../shared/utils/patientAppMappers');

const getProfile = asyncHandler(async (req, res) => {
  const profile = await PatientService.getProfile(req.user.id);
  return successResponse(res, { data: mapPatientProfile(profile) });
});

const updateProfile = asyncHandler(async (req, res) => {
  const { fullName, gender, dateOfBirth, city, address, identityNumber } = req.body;
  if (fullName) {
    await prisma.user.update({ where: { id: req.user.id }, data: { fullName } });
  }
  await PatientService.updateProfile(req.user.id, {
    gender,
    dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
    city,
    address,
    identityNumber,
  });
  const updated = await PatientService.getProfile(req.user.id);
  return successResponse(res, { data: mapPatientProfile(updated), message: 'Profile updated' });
});

module.exports = { getProfile, updateProfile };

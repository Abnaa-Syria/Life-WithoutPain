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
  const displayName = req.body.fullName || req.body.name;
  const { gender, dateOfBirth, city, address, identityNumber } = req.body;
  const userUpdate = {};
  if (displayName) userUpdate.fullName = displayName;
  if (req.body.language) userUpdate.preferredLanguage = req.body.language;
  if (Object.keys(userUpdate).length) {
    await prisma.user.update({ where: { id: req.user.id }, data: userUpdate });
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

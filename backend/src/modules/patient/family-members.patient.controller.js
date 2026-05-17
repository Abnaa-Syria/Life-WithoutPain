const PatientService = require('../patients/patient.service');
const { successResponse, createdResponse } = require('../../shared/responses');
const { asyncHandler } = require('../../utils/helpers');
const { mapFamilyMember } = require('../../shared/utils/patientAppMappers');

const list = asyncHandler(async (req, res) => {
  const data = await PatientService.getFamilyMembers(req.user.id);
  return successResponse(res, { data: data.map(mapFamilyMember) });
});

const create = asyncHandler(async (req, res) => {
  const payload = {
    ...req.body,
    dateOfBirth: req.body.dateOfBirth ? new Date(req.body.dateOfBirth) : undefined,
  };
  const data = await PatientService.createFamilyMember(req.user.id, payload);
  return createdResponse(res, { data: mapFamilyMember(data) });
});

const update = asyncHandler(async (req, res) => {
  const payload = {
    ...req.body,
    dateOfBirth: req.body.dateOfBirth ? new Date(req.body.dateOfBirth) : undefined,
  };
  const data = await PatientService.updateFamilyMember(req.user.id, parseInt(req.params.id, 10), payload);
  return successResponse(res, { data: mapFamilyMember(data), message: 'Family member updated' });
});

const remove = asyncHandler(async (req, res) => {
  await PatientService.deleteFamilyMember(req.user.id, parseInt(req.params.id, 10));
  return successResponse(res, { message: 'Family member deleted' });
});

module.exports = { list, create, update, remove };

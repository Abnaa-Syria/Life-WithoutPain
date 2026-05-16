const DoctorService = require('../doctors/doctor.service');
const { successResponse } = require('../../shared/responses');
const { asyncHandler } = require('../../utils/helpers');
const { mapPatientListItem } = require('../../shared/utils/doctorAppMappers');

const list = asyncHandler(async (req, res) => {
  const patients = await DoctorService.getPatientsWithLastVisit(req.user.id);
  return successResponse(res, { data: patients.map(mapPatientListItem) });
});

const getOne = asyncHandler(async (req, res) => {
  const data = await DoctorService.getPatientDetailForDoctor(req.user.id, req.params.id);
  return successResponse(res, { data });
});

module.exports = { list, getOne };

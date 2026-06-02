const DoctorService = require('../doctors/doctor.service');
const { successResponse, paginatedResponse } = require('../../shared/responses');
const { asyncHandler } = require('../../utils/helpers');
const { mapDoctorForPatientList, mapDoctorForPatientDetail } = require('../../shared/utils/patientAppMappers');

const search = asyncHandler(async (req, res) => {
  const { data, total, page, limit } = await DoctorService.search(req.query);
  return paginatedResponse(res, {
    data: data.map((d) => mapDoctorForPatientList(d, { totalAppointmentsCount: d.totalAppointmentsCount })),
    total,
    page,
    limit,
  });
});

const getById = asyncHandler(async (req, res) => {
  const data = await DoctorService.getPublicDetail(req.params.id);
  return successResponse(res, {
    data: mapDoctorForPatientDetail(data, { totalAppointmentsCount: data.totalAppointmentsCount }),
  });
});

const getAvailability = asyncHandler(async (req, res) => {
  const data = await DoctorService.getAvailabilityForPatient(req.params.id, req.query);
  return successResponse(res, { data });
});

module.exports = { search, getById, getAvailability };

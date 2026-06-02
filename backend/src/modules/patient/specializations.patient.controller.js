const SpecialityService = require('../specialities/speciality.service');
const SubSpecialityService = require('../specialities/subSpeciality.service');
const DoctorService = require('../doctors/doctor.service');
const { successResponse, paginatedResponse } = require('../../shared/responses');
const { asyncHandler } = require('../../utils/helpers');
const { mapDoctorForPatientList } = require('../../shared/utils/patientAppMappers');

const list = asyncHandler(async (req, res) => {
  const { data, total, page, limit } = await SpecialityService.list(
    { ...req.query, isActive: 'true' },
    { activeOnly: true, includeSubs: true },
  );
  return paginatedResponse(res, { data, total, page, limit });
});

const getById = asyncHandler(async (req, res) => {
  const data = await SpecialityService.getById(req.params.id, { includeSubs: true });
  return successResponse(res, { data });
});

const listSubSpecializations = asyncHandler(async (req, res) => {
  const { data, total, page, limit } = await SubSpecialityService.listBySpecialityIds(req.query);
  return paginatedResponse(res, { data, total, page, limit });
});

const getDoctors = asyncHandler(async (req, res) => {
  const { data, total, page, limit } = await DoctorService.listBySpeciality(req.params.id, req.query);
  return paginatedResponse(res, {
    data: data.map((d) =>
      mapDoctorForPatientList(d, {
        totalAppointmentsCount: d.totalAppointmentsCount,
        availableAppointmentsCount: d.availableAppointmentsCount,
      }),
    ),
    total,
    page,
    limit,
  });
});

module.exports = { list, getById, listSubSpecializations, getDoctors };

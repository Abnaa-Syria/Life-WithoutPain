const SpecialityService = require('../specialities/speciality.service');
const DoctorService = require('../doctors/doctor.service');
const { successResponse, paginatedResponse } = require('../../shared/responses');
const { asyncHandler } = require('../../utils/helpers');

const list = asyncHandler(async (req, res) => {
  const { data, total, page, limit } = await SpecialityService.list({ ...req.query, isActive: 'true' });
  return paginatedResponse(res, { data, total, page, limit });
});

const getDoctors = asyncHandler(async (req, res) => {
  const { data, total, page, limit } = await DoctorService.listBySpeciality(req.params.id, req.query);
  return paginatedResponse(res, { data, total, page, limit });
});

module.exports = { list, getDoctors };

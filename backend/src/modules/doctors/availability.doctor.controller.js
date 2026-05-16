const DoctorService = require('./doctor.service');
const { successResponse, createdResponse } = require('../../shared/responses');
const { asyncHandler } = require('../../utils/helpers');

const list = asyncHandler(async (req, res) => {
  const data = await DoctorService.getAvailability(req.user.id);
  return successResponse(res, { data });
});

const create = asyncHandler(async (req, res) => {
  const data = await DoctorService.createAvailabilityBulk(req.user.id, req.body);
  return createdResponse(res, { data, message: 'Availability saved' });
});

module.exports = { list, create };

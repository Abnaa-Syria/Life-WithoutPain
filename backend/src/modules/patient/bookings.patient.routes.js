const router = require('express').Router();
const AppointmentService = require('../appointments/appointment.service');
const { paginatedResponse } = require('../../shared/responses');
const { asyncHandler } = require('../../utils/helpers');

router.get('/', asyncHandler(async (req, res) => {
  const { data, total, page, limit } = await AppointmentService.listBookingsForPatient(req.user.id, req.query);
  return paginatedResponse(res, { data, total, page, limit });
}));

module.exports = router;

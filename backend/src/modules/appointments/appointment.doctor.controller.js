const AppointmentService = require('./appointment.service');
const { successResponse } = require('../../shared/responses');
const { asyncHandler } = require('../../utils/helpers');
const { mapAppointmentListItem, mapAppointmentDetail } = require('../../shared/utils/doctorAppMappers');

const list = asyncHandler(async (req, res) => {
  const { data } = await AppointmentService.getForDoctor(req.user.id, req.query);
  return successResponse(res, { data: data.map(mapAppointmentListItem) });
});

const getOne = asyncHandler(async (req, res) => {
  const appt = await AppointmentService.getByIdForDoctor(req.user.id, req.params.id);
  return successResponse(res, { data: mapAppointmentDetail(appt) });
});

const confirm = asyncHandler(async (req, res) => {
  const data = await AppointmentService.updateStatusForDoctor(req.user.id, req.params.id, 'CONFIRMED');
  return successResponse(res, { data, messageKey: 'APPOINTMENT_CONFIRMED' });
});

const reject = asyncHandler(async (req, res) => {
  const data = await AppointmentService.updateStatusForDoctor(req.user.id, req.params.id, 'CANCELLED', {
    reason: req.body?.reason || 'Rejected by doctor',
  });
  return successResponse(res, { data, message: 'Appointment rejected' });
});

const cancel = asyncHandler(async (req, res) => {
  const data = await AppointmentService.updateStatusForDoctor(req.user.id, req.params.id, 'CANCELLED', {
    reason: req.body?.reason,
  });
  return successResponse(res, { data, messageKey: 'APPOINTMENT_CANCELLED' });
});

module.exports = { list, getOne, confirm, reject, cancel };

const AppointmentService = require('../appointments/appointment.service');
const CallSessionService = require('../call-sessions/callSession.service');
const { successResponse, createdResponse, paginatedResponse } = require('../../shared/responses');
const { asyncHandler } = require('../../utils/helpers');
const { mapAppointmentListItem, mapAppointmentDetail } = require('../../shared/utils/patientAppMappers');

const list = asyncHandler(async (req, res) => {
  const { data, total, page, limit } = await AppointmentService.listForPatient(req.user.id, req.query);
  return paginatedResponse(res, {
    data: data.map(mapAppointmentListItem),
    total,
    page,
    limit,
  });
});

const getById = asyncHandler(async (req, res) => {
  const data = await AppointmentService.getByIdForPatient(req.user.id, req.params.id);
  return successResponse(res, { data: mapAppointmentDetail(data) });
});

const create = asyncHandler(async (req, res) => {
  const data = await AppointmentService.createForPatient(req.user.id, req.body);
  return createdResponse(res, { data: mapAppointmentListItem(data), message: 'Appointment booked' });
});

const bookPersonal = asyncHandler(async (req, res) => {
  const data = await AppointmentService.createForPatient(req.user.id, { ...req.body, bookingFor: 'personal' });
  return createdResponse(res, { data: mapAppointmentListItem(data), message: 'Appointment booked' });
});

const bookFamily = asyncHandler(async (req, res) => {
  const data = await AppointmentService.createForPatient(req.user.id, { ...req.body, bookingFor: 'family' });
  return createdResponse(res, { data: mapAppointmentListItem(data), message: 'Appointment booked for family member' });
});

const upcoming = asyncHandler(async (req, res) => {
  const { data, total, page, limit } = await AppointmentService.getUpcomingForPatient(req.user.id, req.query);
  return paginatedResponse(res, {
    data: data.map(mapAppointmentListItem),
    total,
    page,
    limit,
  });
});

const cancel = asyncHandler(async (req, res) => {
  const data = await AppointmentService.cancelForPatient(req.user.id, req.params.id, req.body);
  return successResponse(res, { data: mapAppointmentListItem(data), messageKey: 'APPOINTMENT_CANCELLED' });
});

const reschedule = asyncHandler(async (req, res) => {
  const data = await AppointmentService.rescheduleForPatient(req.user.id, req.params.id, req.body);
  return successResponse(res, { data: mapAppointmentListItem(data), messageKey: 'APPOINTMENT_RESCHEDULED' });
});

const getSession = asyncHandler(async (req, res) => {
  const data = await CallSessionService.getOrJoinForPatient(req.user.id, req.params.id);
  return successResponse(res, { data });
});

module.exports = { list, getById, create, bookPersonal, bookFamily, upcoming, cancel, reschedule, getSession };

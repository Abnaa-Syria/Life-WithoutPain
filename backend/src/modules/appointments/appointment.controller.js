const AppointmentService = require('./appointment.service');
const { successResponse, createdResponse, paginatedResponse } = require('../../shared/responses');
const { asyncHandler } = require('../../utils/helpers');

const create = asyncHandler(async (req, res) => {
  const data = await AppointmentService.create(req.user.id, req.body);
  return createdResponse(res, { data, message: 'Appointment created' });
});

const getAll = asyncHandler(async (req, res) => {
  const { data, total, page, limit } = await AppointmentService.getAll(req.user.role, req.user.id, req.query);
  return paginatedResponse(res, { data, total, page, limit });
});

const getById = asyncHandler(async (req, res) => {
  const data = await AppointmentService.getById(req.params.id, req.user.role, req.user.id);
  return successResponse(res, { data });
});

const confirm = asyncHandler(async (req, res) => {
  const data = await AppointmentService.updateStatus(req.params.id, 'CONFIRMED', req.user.id);
  return successResponse(res, { data, message: 'Appointment confirmed' });
});

const reschedule = asyncHandler(async (req, res) => {
  const data = await AppointmentService.updateStatus(req.params.id, 'RESCHEDULED', req.user.id, req.body);
  return successResponse(res, { data, message: 'Appointment rescheduled' });
});

const cancel = asyncHandler(async (req, res) => {
  const data = await AppointmentService.updateStatus(req.params.id, 'CANCELLED', req.user.id, req.body);
  return successResponse(res, { data, message: 'Appointment cancelled' });
});

const start = asyncHandler(async (req, res) => {
  const data = await AppointmentService.updateStatus(req.params.id, 'IN_PROGRESS', req.user.id);
  return successResponse(res, { data, message: 'Consultation started' });
});

const complete = asyncHandler(async (req, res) => {
  const data = await AppointmentService.updateStatus(req.params.id, 'COMPLETED', req.user.id);
  return successResponse(res, { data, message: 'Consultation completed' });
});

const getAttachments = asyncHandler(async (req, res) => {
  const data = await AppointmentService.getAttachments(req.params.id);
  return successResponse(res, { data });
});

const addAttachment = asyncHandler(async (req, res) => {
  const fileData = {
    fileUrl: req.file ? `/uploads/${req.file.filename}` : req.body.fileUrl,
    type: req.body.type || 'DOCUMENT',
    uploadedBy: req.user.id,
  };
  const data = await AppointmentService.addAttachment(req.params.id, fileData);
  return createdResponse(res, { data });
});

module.exports = { create, getAll, getById, confirm, reschedule, cancel, start, complete, getAttachments, addAttachment };

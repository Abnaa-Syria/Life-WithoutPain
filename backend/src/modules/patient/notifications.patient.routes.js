const router = require('express').Router();
const NotificationController = require('../notifications/notification.controller');
const PatientService = require('../patients/patient.service');
const { paginatedResponse } = require('../../shared/responses');
const { asyncHandler } = require('../../utils/helpers');

router.get('/', asyncHandler(async (req, res) => {
  const { data, total, page, limit } = await PatientService.getNotifications(req.user.id, req.query);
  return paginatedResponse(res, { data, total, page, limit });
}));

router.patch('/read-all', NotificationController.markAllRead);
router.patch('/:id/read', NotificationController.markRead);

module.exports = router;

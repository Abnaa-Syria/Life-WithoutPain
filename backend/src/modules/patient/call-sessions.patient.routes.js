const router = require('express').Router();
const CallSessionService = require('../call-sessions/callSession.service');
const { successResponse } = require('../../shared/responses');
const { asyncHandler } = require('../../utils/helpers');

router.get('/by-appointment/:appointmentId', asyncHandler(async (req, res) => {
  const data = await CallSessionService.getOrJoinForPatient(req.user.id, req.params.appointmentId);
  return successResponse(res, { data });
}));

module.exports = router;

const router = require('express').Router();
const PatientService = require('../patients/patient.service');
const { successResponse } = require('../../shared/responses');
const { asyncHandler } = require('../../utils/helpers');

router.get('/', asyncHandler(async (req, res) => {
  const data = await PatientService.getSettings(req.user.id);
  return successResponse(res, { data });
}));

router.patch('/', asyncHandler(async (req, res) => {
  const data = await PatientService.updateSettings(req.user.id, req.body);
  return successResponse(res, { data, messageKey: 'SETTINGS_UPDATED' });
}));

module.exports = router;

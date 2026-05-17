const router = require('express').Router();
const PatientService = require('../patients/patient.service');
const { successResponse } = require('../../shared/responses');
const { asyncHandler } = require('../../utils/helpers');

router.get('/', asyncHandler(async (req, res) => {
  const data = await PatientService.getMedicalProfile(req.user.id);
  return successResponse(res, { data });
}));

router.put('/', asyncHandler(async (req, res) => {
  const data = await PatientService.updateMedicalProfile(req.user.id, req.body);
  return successResponse(res, { data, message: 'Medical profile updated' });
}));

module.exports = router;

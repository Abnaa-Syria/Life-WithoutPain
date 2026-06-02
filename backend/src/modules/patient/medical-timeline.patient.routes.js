const router = require('express').Router();
const PatientService = require('../patients/patient.service');
const { successResponse, paginatedResponse } = require('../../shared/responses');
const { asyncHandler } = require('../../utils/helpers');
const { mapTimelineItem } = require('../../shared/utils/patientAppMappers');

router.get('/', asyncHandler(async (req, res) => {
  const { data, total, page, limit } = await PatientService.getMedicalTimeline(req.user.id, req.query);
  return paginatedResponse(res, { data, total, page, limit });
}));

module.exports = router;

const PatientService = require('../patients/patient.service');
const { successResponse, createdResponse } = require('../../shared/responses');
const { asyncHandler } = require('../../utils/helpers');
const { mapInsurance } = require('../../shared/utils/patientAppMappers');

const list = asyncHandler(async (req, res) => {
  const data = await PatientService.getInsurances(req.user.id);
  return successResponse(res, { data: data.map(mapInsurance) });
});

const create = asyncHandler(async (req, res) => {
  const attachmentUrl = req.file ? `/uploads/${req.file.filename}` : req.body.attachmentUrl;
  const data = await PatientService.createInsurance(req.user.id, {
    providerId: parseInt(req.body.providerId, 10),
    memberId: req.body.memberId || req.body.policyNumber,
    policyNumber: req.body.policyNumber || req.body.memberId,
    expiryDate: req.body.expiryDate ? new Date(req.body.expiryDate) : undefined,
    attachmentUrl,
    isPrimary: req.body.isPrimary === 'true' || req.body.isPrimary === true,
  });
  return createdResponse(res, { data: mapInsurance(data) });
});

const update = asyncHandler(async (req, res) => {
  const attachmentUrl = req.file ? `/uploads/${req.file.filename}` : req.body.attachmentUrl;
  const data = await PatientService.updateInsurance(req.user.id, parseInt(req.params.id, 10), {
    providerId: req.body.providerId ? parseInt(req.body.providerId, 10) : undefined,
    memberId: req.body.memberId,
    policyNumber: req.body.policyNumber,
    expiryDate: req.body.expiryDate ? new Date(req.body.expiryDate) : undefined,
    attachmentUrl,
    isPrimary: req.body.isPrimary,
  });
  return successResponse(res, { data: mapInsurance(data), messageKey: 'INSURANCE_UPDATED' });
});

const remove = asyncHandler(async (req, res) => {
  await PatientService.deleteInsurance(req.user.id, parseInt(req.params.id, 10));
  return successResponse(res, { messageKey: 'INSURANCE_REMOVED' });
});

module.exports = { list, create, update, remove };

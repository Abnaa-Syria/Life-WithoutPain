const router = require('express').Router();
const MedicalProfileService = require('../medical-profile/medical-profile.service');
const { validate } = require('../../middlewares/validate');
const { successResponse, createdResponse } = require('../../shared/responses');
const { asyncHandler } = require('../../utils/helpers');
const {
  updateMedicalProfileSchema,
  attachmentIdParamSchema,
  attachmentUploadBodySchema,
} = require('../medical-profile/medical-profile.validator');
const {
  medicalProfileAttachmentsUpload,
  getAttachmentTitlesFromBody,
} = require('../medical-profile/medical-profile.middleware');

router.get('/', asyncHandler(async (req, res) => {
  const data = await MedicalProfileService.getByUserId(req.user.id);
  return successResponse(res, { data });
}));

router.put(
  '/',
  validate(updateMedicalProfileSchema),
  asyncHandler(async (req, res) => {
    const data = await MedicalProfileService.updateByUserId(req.user.id, req.body);
    return successResponse(res, { data, message: 'Medical profile updated' });
  }),
);

router.get('/attachments', asyncHandler(async (req, res) => {
  const data = await MedicalProfileService.listAttachmentsByUserId(req.user.id);
  return successResponse(res, { data });
}));

router.post(
  '/attachments',
  medicalProfileAttachmentsUpload,
  validate(attachmentUploadBodySchema),
  asyncHandler(async (req, res) => {
    const data = await MedicalProfileService.addAttachmentsByUserId(
      req.user.id,
      req.files,
      getAttachmentTitlesFromBody(req.body),
    );
    return createdResponse(res, { data, message: 'Attachments uploaded' });
  }),
);

router.post('/chronic-diseases/:id', asyncHandler(async (req, res) => {
  const data = await MedicalProfileService.addCatalogItemByUserId(req.user.id, 'chronicDiseases', req.params.id);
  return successResponse(res, { data, message: 'Chronic disease added' });
}));

router.delete('/chronic-diseases/:id', asyncHandler(async (req, res) => {
  const data = await MedicalProfileService.removeCatalogItemByUserId(req.user.id, 'chronicDiseases', req.params.id);
  return successResponse(res, { data, message: 'Chronic disease removed' });
}));

router.post('/medications/:id', asyncHandler(async (req, res) => {
  const data = await MedicalProfileService.addCatalogItemByUserId(req.user.id, 'medications', req.params.id);
  return successResponse(res, { data, message: 'Medication added' });
}));

router.delete('/medications/:id', asyncHandler(async (req, res) => {
  const data = await MedicalProfileService.removeCatalogItemByUserId(req.user.id, 'medications', req.params.id);
  return successResponse(res, { data, message: 'Medication removed' });
}));

router.delete(
  '/attachments/:id',
  validate(attachmentIdParamSchema, 'params'),
  asyncHandler(async (req, res) => {
    const data = await MedicalProfileService.deleteAttachmentByUserId(
      req.user.id,
      req.params.id,
    );
    return successResponse(res, { data, message: 'Attachment deleted' });
  }),
);

module.exports = router;

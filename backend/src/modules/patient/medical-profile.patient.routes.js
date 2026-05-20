const router = require('express').Router();
const MedicalProfileService = require('../medical-profile/medical-profile.service');
const { validate } = require('../../middlewares/validate');
const { uploadMultiple } = require('../../middlewares/upload');
const { successResponse, createdResponse } = require('../../shared/responses');
const { asyncHandler } = require('../../utils/helpers');
const {
  updateMedicalProfileSchema,
  attachmentIdParamSchema,
} = require('../medical-profile/medical-profile.validator');

router.get('/', asyncHandler(async (req, res) => {
  const data = await MedicalProfileService.getByUserId(req.user.id);
  return successResponse(res, { data });
}));

router.put('/', validate(updateMedicalProfileSchema), asyncHandler(async (req, res) => {
  const data = await MedicalProfileService.updateByUserId(req.user.id, req.body);
  return successResponse(res, { data, message: 'Medical profile updated' });
}));

router.post(
  '/attachments',
  uploadMultiple('files', 10),
  asyncHandler(async (req, res) => {
    const titles = req.body.titles
      ? (Array.isArray(req.body.titles) ? req.body.titles : [req.body.titles])
      : [];
    const data = await MedicalProfileService.addAttachmentsByUserId(req.user.id, req.files, titles);
    return createdResponse(res, { data, message: 'Attachments uploaded' });
  }),
);

router.delete(
  '/attachments/:attachmentId',
  validate(attachmentIdParamSchema, 'params'),
  asyncHandler(async (req, res) => {
    const data = await MedicalProfileService.deleteAttachmentByUserId(
      req.user.id,
      req.params.attachmentId,
    );
    return successResponse(res, { data, message: 'Attachment deleted' });
  }),
);

module.exports = router;

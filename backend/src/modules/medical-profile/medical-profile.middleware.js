const { createUpload } = require('../../middlewares/upload');

const MEDICAL_PROFILE_FILE_FIELDS = [
  { name: 'files', maxCount: 10 },
  { name: 'file', maxCount: 10 },
];

function normalizeUploadedFiles(req) {
  if (Array.isArray(req.files)) return req.files;
  if (req.files && typeof req.files === 'object') {
    return Object.values(req.files).flat().filter(Boolean);
  }
  if (req.file) return [req.file];
  return [];
}

function medicalProfileAttachmentsUpload(req, res, next) {
  return createUpload().fields(MEDICAL_PROFILE_FILE_FIELDS)(req, res, (err) => {
    if (err) return next(err);
    req.files = normalizeUploadedFiles(req);
    next();
  });
}

function getAttachmentTitlesFromBody(body) {
  if (body.titles) {
    return Array.isArray(body.titles) ? body.titles : [body.titles];
  }
  if (body.title) {
    return Array.isArray(body.title) ? body.title : [body.title];
  }
  return [];
}

module.exports = {
  medicalProfileAttachmentsUpload,
  getAttachmentTitlesFromBody,
};

const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');
const { BadRequestError } = require('../shared/errors/AppError');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.upload.dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    cb(null, filename);
  },
});

const fileFilter = (allowedTypes) => (req, file, cb) => {
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new BadRequestError('FILE_TYPE_NOT_ALLOWED', { mimetype: file.mimetype }), false);
  }
};

const createUpload = (options = {}) => {
  const {
    allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    maxSize = config.upload.maxFileSize,
  } = options;

  return multer({
    storage,
    fileFilter: fileFilter(allowedTypes),
    limits: { fileSize: maxSize },
  });
};

const uploadSingle = (fieldName = 'file', options = {}) => createUpload(options).single(fieldName);
const uploadMultiple = (fieldName = 'files', maxCount = 5, options = {}) => createUpload(options).array(fieldName, maxCount);

module.exports = { createUpload, uploadSingle, uploadMultiple };

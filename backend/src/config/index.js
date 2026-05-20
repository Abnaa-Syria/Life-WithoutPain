const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 4000,
  apiPrefix: process.env.API_PREFIX || '/api/v1',

  db: {
    url: process.env.DATABASE_URL,
  },

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'default-access-secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  otp: {
    expiryMinutes: parseInt(process.env.OTP_EXPIRY_MINUTES, 10) || 5,
    length: parseInt(process.env.OTP_LENGTH, 10) || 6,
    provider: process.env.OTP_PROVIDER || 'mock',
    stubCode: process.env.OTP_STUB_CODE || '12345',
    allowStub: process.env.OTP_ALLOW_STUB === 'true' || (process.env.OTP_PROVIDER || 'mock') === 'mock',
  },

  upload: {
    dir: process.env.UPLOAD_DIR || 'uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 10 * 1024 * 1024,
  },

  storage: {
    provider: process.env.STORAGE_PROVIDER || 'local',
    s3: {
      bucket: process.env.AWS_S3_BUCKET,
      region: process.env.AWS_S3_REGION,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  },

  payment: {
    provider: process.env.PAYMENT_PROVIDER || 'mock',
    apiKey: process.env.PAYMENT_API_KEY,
    secretKey: process.env.PAYMENT_SECRET_KEY,
    webhookSecret: process.env.PAYMENT_WEBHOOK_SECRET,
  },

  video: {
    provider: process.env.VIDEO_PROVIDER || 'mock',
    appId: process.env.VIDEO_APP_ID,
    appCertificate: process.env.VIDEO_APP_CERTIFICATE,
  },

  insurance: {
    provider: process.env.INSURANCE_PROVIDER || 'mock',
    apiUrl: process.env.INSURANCE_API_URL,
    apiKey: process.env.INSURANCE_API_KEY,
  },

  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
  },

  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },

  patient: {
    comingWindowHours: parseInt(process.env.PATIENT_COMING_WINDOW_HOURS, 10) || 24,
  },
};

module.exports = config;

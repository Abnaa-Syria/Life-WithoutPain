const router = require('express').Router();
const { authenticate, authorize } = require('../../middlewares/auth');
const { asyncHandler } = require('../../utils/helpers');
const { successResponse, createdResponse, paginatedResponse } = require('../../shared/responses');
const { buildPagination } = require('../../utils/pagination');
const prisma = require('../../config/database');
const { ROLES, ADMIN_ROLES } = require('../../constants');
const { NotFoundError } = require('../../shared/errors/AppError');
const { createAuditLog } = require('../../middlewares/auditLog');
const bcrypt = require('bcryptjs');
const MedicalProfileService = require('../medical-profile/medical-profile.service');
const { uploadMultiple } = require('../../middlewares/upload');
const { validate } = require('../../middlewares/validate');
const {
  updateMedicalProfileSchema,
  attachmentIdParamSchema,
  patientIdParamSchema,
  patientIdFromIdParamSchema,
} = require('../medical-profile/medical-profile.validator');
const { mapMedicalProfile } = require('../../shared/utils/patientAppMappers');

const MEDICAL_PROFILE_INCLUDE = {
  chronicDiseases: { orderBy: { nameEn: 'asc' } },
  medications: { orderBy: { nameEn: 'asc' } },
  allergies: { orderBy: { nameEn: 'asc' } },
  attachments: { orderBy: { createdAt: 'desc' } },
};

router.use(authenticate);
router.use(authorize(...ADMIN_ROLES));

// ═══════════════════════════════════════════
//  Helper: generic CRUD factory
// ═══════════════════════════════════════════
function crud(model, { searchFields = [], include, defaultOrder = { createdAt: 'desc' }, filterFn, entityLabel = model } = {}) {
  const list = asyncHandler(async (req, res) => {
    const { page, limit, skip } = buildPagination(req.query);
    let where = {};
    if (req.query.search && searchFields.length) {
      where.OR = searchFields.map((f) => {
        if (f.includes('.')) {
          const [rel, field] = f.split('.');
          return { [rel]: { [field]: { contains: req.query.search } } };
        }
        return { [f]: { contains: req.query.search } };
      });
    }
    if (filterFn) where = { ...where, ...filterFn(req.query) };
    const [data, total] = await Promise.all([
      prisma[model].findMany({ where, skip, take: limit, orderBy: defaultOrder, ...(include ? { include } : {}) }),
      prisma[model].count({ where }),
    ]);
    return paginatedResponse(res, { data, total, page, limit });
  });

  const getOne = asyncHandler(async (req, res) => {
    const data = await prisma[model].findUnique({ where: { id: parseInt(req.params.id) }, ...(include ? { include } : {}) });
    if (!data) throw new NotFoundError(`${entityLabel} not found`);
    return successResponse(res, { data });
  });

  const create = asyncHandler(async (req, res) => {
    const data = await prisma[model].create({ data: req.body });
    createAuditLog({ actorId: req.user.id, entityType: entityLabel, entityId: data.id, action: 'CREATE', newValues: req.body, req });
    return createdResponse(res, { data });
  });

  const update = asyncHandler(async (req, res) => {
    const data = await prisma[model].update({ where: { id: parseInt(req.params.id) }, data: req.body });
    createAuditLog({ actorId: req.user.id, entityType: entityLabel, entityId: data.id, action: 'UPDATE', newValues: req.body, req });
    return successResponse(res, { data });
  });

  const remove = asyncHandler(async (req, res) => {
    await prisma[model].delete({ where: { id: parseInt(req.params.id) } });
    createAuditLog({ actorId: req.user.id, entityType: entityLabel, entityId: parseInt(req.params.id), action: 'DELETE', req });
    return successResponse(res, { data: null, message: `${entityLabel} deleted` });
  });

  return { list, getOne, create, update, remove };
}

// ═══════════════════════════════════════════
//  USERS – full CRUD
// ═══════════════════════════════════════════
router.get('/users', asyncHandler(async (req, res) => {
  const { page, limit, skip } = buildPagination(req.query);
  const where = { deletedAt: null };
  if (req.query.role) where.role = req.query.role;
  if (req.query.status) where.status = req.query.status;
  if (req.query.search) where.OR = [{ fullName: { contains: req.query.search } }, { email: { contains: req.query.search } }, { phone: { contains: req.query.search } }];
  const [data, total] = await Promise.all([
    prisma.user.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' }, select: { id: true, fullName: true, email: true, phone: true, role: true, status: true, isVerified: true, createdAt: true, lastLoginAt: true } }),
    prisma.user.count({ where }),
  ]);
  return paginatedResponse(res, { data, total, page, limit });
}));
router.get('/users/:id', asyncHandler(async (req, res) => {
  const data = await prisma.user.findUnique({ where: { id: parseInt(req.params.id) }, select: { id: true, fullName: true, email: true, phone: true, role: true, status: true, isVerified: true, preferredLanguage: true, darkModeEnabled: true, avatarUrl: true, createdAt: true, lastLoginAt: true } });
  if (!data) throw new NotFoundError('User not found');
  return successResponse(res, { data });
}));
router.post('/users', asyncHandler(async (req, res) => {
  const passwordHash = await bcrypt.hash(req.body.password || 'Password123', 12);
  const { password, ...rest } = req.body;
  const data = await prisma.user.create({ data: { ...rest, passwordHash, isVerified: true }, select: { id: true, fullName: true, email: true, phone: true, role: true, status: true } });
  createAuditLog({ actorId: req.user.id, entityType: 'User', entityId: data.id, action: 'CREATE', newValues: { role: rest.role }, req });
  return createdResponse(res, { data });
}));
router.put('/users/:id', asyncHandler(async (req, res) => {
  const { password, ...updateData } = req.body;
  if (password) updateData.passwordHash = await bcrypt.hash(password, 12);
  const data = await prisma.user.update({ where: { id: parseInt(req.params.id) }, data: updateData, select: { id: true, fullName: true, email: true, phone: true, role: true, status: true } });
  createAuditLog({ actorId: req.user.id, entityType: 'User', entityId: data.id, action: 'UPDATE', newValues: updateData, req });
  return successResponse(res, { data });
}));
router.delete('/users/:id', asyncHandler(async (req, res) => {
  await prisma.user.update({ where: { id: parseInt(req.params.id) }, data: { deletedAt: new Date(), status: 'INACTIVE' } });
  createAuditLog({ actorId: req.user.id, entityType: 'User', entityId: parseInt(req.params.id), action: 'DELETE', req });
  return successResponse(res, { data: null, message: 'User deactivated' });
}));

// ═══════════════════════════════════════════
//  PATIENTS – full CRUD
// ═══════════════════════════════════════════
router.get('/patients', asyncHandler(async (req, res) => {
  const { page, limit, skip } = buildPagination(req.query);
  const where = {};
  if (req.query.search) where.user = { fullName: { contains: req.query.search } };
  const [data, total] = await Promise.all([
    prisma.patientProfile.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' }, include: { user: { select: { id: true, fullName: true, email: true, phone: true, status: true, isVerified: true } } } }),
    prisma.patientProfile.count({ where }),
  ]);
  return paginatedResponse(res, { data, total, page, limit });
}));
router.get('/patients/:id', asyncHandler(async (req, res) => {
  const data = await prisma.patientProfile.findUnique({ 
    where: { id: parseInt(req.params.id) }, 
    include: { 
      user: true, 
      medicalProfile: { include: MEDICAL_PROFILE_INCLUDE },
      familyMembers: true, 
      insurances: { include: { provider: true } },
      prescriptions: { include: { items: true, doctor: { include: { user: { select: { fullName: true } } } } }, orderBy: { createdAt: 'desc' } },
      reports: { include: { doctor: { include: { user: { select: { fullName: true } } } } }, orderBy: { createdAt: 'desc' } },
      medicalFiles: true
    } 
  });
  if (!data) throw new NotFoundError('Patient not found');
  const response = {
    ...data,
    medicalProfile: data.medicalProfile ? mapMedicalProfile(data.medicalProfile) : null,
  };
  return successResponse(res, { data: response });
}));

router.put(
  '/patients/:id/medical-profile',
  validate(patientIdFromIdParamSchema, 'params'),
  validate(updateMedicalProfileSchema),
  asyncHandler(async (req, res) => {
    const data = await MedicalProfileService.updateByPatientId(req.params.id, req.body);
    return successResponse(res, { data, message: 'Medical profile updated' });
  }),
);

router.post(
  '/patients/:patientId/medical-profile/attachments',
  validate(patientIdParamSchema, 'params'),
  uploadMultiple('files', 10),
  asyncHandler(async (req, res) => {
    const titles = req.body.titles
      ? (Array.isArray(req.body.titles) ? req.body.titles : [req.body.titles])
      : [];
    const attachments = await MedicalProfileService.addAttachmentsByPatientId(
      req.params.patientId,
      req.files,
      titles,
    );
    return createdResponse(res, { data: attachments, message: 'Attachments uploaded' });
  }),
);

router.delete(
  '/patients/:patientId/medical-profile/attachments/:attachmentId',
  validate(patientIdParamSchema, 'params'),
  validate(attachmentIdParamSchema, 'params'),
  asyncHandler(async (req, res) => {
    const data = await MedicalProfileService.deleteAttachmentByPatientId(
      req.params.patientId,
      req.params.attachmentId,
    );
    return successResponse(res, { data, message: 'Attachment deleted' });
  }),
);
router.put('/patients/:id', asyncHandler(async (req, res) => {
  const { userData, ...profileData } = req.body;
  const data = await prisma.patientProfile.update({ where: { id: parseInt(req.params.id) }, data: profileData });
  if (userData) {
    await prisma.user.update({ where: { id: data.userId }, data: userData });
  }
  createAuditLog({ actorId: req.user.id, entityType: 'PatientProfile', entityId: data.id, action: 'UPDATE', newValues: req.body, req });
  return successResponse(res, { data });
}));
router.delete('/patients/:id', asyncHandler(async (req, res) => {
  const pat = await prisma.patientProfile.findUnique({ where: { id: parseInt(req.params.id) } });
  if (pat) await prisma.user.update({ where: { id: pat.userId }, data: { deletedAt: new Date(), status: 'INACTIVE' } });
  createAuditLog({ actorId: req.user.id, entityType: 'PatientProfile', entityId: parseInt(req.params.id), action: 'DELETE', req });
  return successResponse(res, { data: null, message: 'Patient deactivated' });
}));

// ═══════════════════════════════════════════
//  SERVICES – full CRUD
// ═══════════════════════════════════════════
const svcCrud = crud('service', { searchFields: ['nameAr', 'nameEn'], entityLabel: 'Service', defaultOrder: { sortOrder: 'asc' } });
router.get('/services', svcCrud.list);
router.get('/services/:id', svcCrud.getOne);
router.post('/services', svcCrud.create);
router.put('/services/:id', svcCrud.update);
router.delete('/services/:id', svcCrud.remove);

// ═══════════════════════════════════════════
//  INSURANCE PROVIDERS – full CRUD
// ═══════════════════════════════════════════
const ipCrud = crud('insuranceProvider', { searchFields: ['nameAr', 'nameEn', 'code'], entityLabel: 'InsuranceProvider' });
router.get('/insurance-providers', ipCrud.list);
router.get('/insurance-providers/:id', ipCrud.getOne);
router.post('/insurance-providers', ipCrud.create);
router.put('/insurance-providers/:id', ipCrud.update);
router.delete('/insurance-providers/:id', ipCrud.remove);

// ═══════════════════════════════════════════
//  APPOINTMENTS – full CRUD
// ═══════════════════════════════════════════
router.get('/appointments', asyncHandler(async (req, res) => {
  const { page, limit, skip } = buildPagination(req.query);
  const where = {};
  if (req.query.status) where.status = req.query.status;
  if (req.query.date) where.appointmentDate = new Date(req.query.date);
  if (req.query.search) where.OR = [{ patient: { user: { fullName: { contains: req.query.search } } } }, { doctor: { user: { fullName: { contains: req.query.search } } } }];
  const [data, total] = await Promise.all([
    prisma.appointment.findMany({ where, skip, take: limit, orderBy: { appointmentDate: 'desc' }, include: { patient: { include: { user: { select: { fullName: true } } } }, doctor: { include: { user: { select: { fullName: true } }, speciality: true } }, service: true } }),
    prisma.appointment.count({ where }),
  ]);
  return paginatedResponse(res, { data, total, page, limit });
}));
router.get('/appointments/:id', asyncHandler(async (req, res) => {
  const data = await prisma.appointment.findUnique({ where: { id: parseInt(req.params.id) }, include: { patient: { include: { user: true } }, doctor: { include: { user: true, speciality: true } }, service: true, attachments: true, prescriptions: true, reports: true } });
  if (!data) throw new NotFoundError('Appointment not found');
  return successResponse(res, { data });
}));
router.put('/appointments/:id', asyncHandler(async (req, res) => {
  const data = await prisma.appointment.update({ where: { id: parseInt(req.params.id) }, data: req.body });
  createAuditLog({ actorId: req.user.id, entityType: 'Appointment', entityId: data.id, action: 'UPDATE', newValues: req.body, req });
  return successResponse(res, { data });
}));
router.delete('/appointments/:id', asyncHandler(async (req, res) => {
  await prisma.appointment.update({ where: { id: parseInt(req.params.id) }, data: { status: 'CANCELLED', cancellationReason: 'Cancelled by admin' } });
  createAuditLog({ actorId: req.user.id, entityType: 'Appointment', entityId: parseInt(req.params.id), action: 'DELETE', req });
  return successResponse(res, { data: null, message: 'Appointment cancelled' });
}));

// ═══════════════════════════════════════════
//  INSURANCE CASES – full CRUD
// ═══════════════════════════════════════════
router.get('/insurance-cases', asyncHandler(async (req, res) => {
  const { page, limit, skip } = buildPagination(req.query);
  const where = {};
  if (req.query.status) where.status = req.query.status;
  if (req.query.search) where.patient = { user: { fullName: { contains: req.query.search } } };
  const [data, total] = await Promise.all([
    prisma.insuranceCase.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' }, include: { provider: true, patient: { include: { user: { select: { fullName: true } } } } } }),
    prisma.insuranceCase.count({ where }),
  ]);
  return paginatedResponse(res, { data, total, page, limit });
}));
router.get('/insurance-cases/:id', asyncHandler(async (req, res) => {
  const data = await prisma.insuranceCase.findUnique({ where: { id: parseInt(req.params.id) }, include: { provider: true, patient: { include: { user: true } }, approvals: true } });
  if (!data) throw new NotFoundError('Insurance case not found');
  return successResponse(res, { data });
}));
router.put('/insurance-cases/:id', asyncHandler(async (req, res) => {
  const data = await prisma.insuranceCase.update({ where: { id: parseInt(req.params.id) }, data: req.body });
  createAuditLog({ actorId: req.user.id, entityType: 'InsuranceCase', entityId: data.id, action: 'UPDATE', newValues: req.body, req });
  return successResponse(res, { data });
}));
router.delete('/insurance-cases/:id', asyncHandler(async (req, res) => {
  await prisma.insuranceCase.update({ where: { id: parseInt(req.params.id) }, data: { status: 'CLOSED', resolvedAt: new Date() } });
  createAuditLog({ actorId: req.user.id, entityType: 'InsuranceCase', entityId: parseInt(req.params.id), action: 'DELETE', req });
  return successResponse(res, { data: null, message: 'Insurance case closed' });
}));

// ═══════════════════════════════════════════
//  SUPPORT CASES – full CRUD
// ═══════════════════════════════════════════
router.get('/support-cases', asyncHandler(async (req, res) => {
  const { page, limit, skip } = buildPagination(req.query);
  const where = {};
  if (req.query.status) where.status = req.query.status;
  if (req.query.search) where.subject = { contains: req.query.search };
  const [data, total] = await Promise.all([
    prisma.supportCase.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' }, include: { assignee: { select: { fullName: true } }, patient: { include: { user: { select: { fullName: true } } } } } }),
    prisma.supportCase.count({ where }),
  ]);
  return paginatedResponse(res, { data, total, page, limit });
}));
router.get('/support-cases/:id', asyncHandler(async (req, res) => {
  const data = await prisma.supportCase.findUnique({ where: { id: parseInt(req.params.id) }, include: { assignee: { select: { fullName: true } }, patient: { include: { user: true } }, messages: { include: { sender: { select: { fullName: true, role: true } } } } } });
  if (!data) throw new NotFoundError('Support case not found');
  return successResponse(res, { data });
}));
router.put('/support-cases/:id', asyncHandler(async (req, res) => {
  const data = await prisma.supportCase.update({ where: { id: parseInt(req.params.id) }, data: req.body });
  createAuditLog({ actorId: req.user.id, entityType: 'SupportCase', entityId: data.id, action: 'UPDATE', newValues: req.body, req });
  return successResponse(res, { data });
}));
router.delete('/support-cases/:id', asyncHandler(async (req, res) => {
  await prisma.supportCase.update({ where: { id: parseInt(req.params.id) }, data: { status: 'CLOSED', resolutionNotes: 'Closed by admin' } });
  createAuditLog({ actorId: req.user.id, entityType: 'SupportCase', entityId: parseInt(req.params.id), action: 'DELETE', req });
  return successResponse(res, { data: null, message: 'Support case closed' });
}));

// ═══════════════════════════════════════════
//  LAB TESTS – full CRUD
// ═══════════════════════════════════════════
const labCrud = crud('labTestRequest', {
  searchFields: ['title'],
  entityLabel: 'LabTest',
  include: { patient: { include: { user: { select: { fullName: true } } } }, doctor: { include: { user: { select: { fullName: true } } } }, results: true },
  filterFn: (q) => ({ ...(q.status ? { status: q.status } : {}) }),
});
router.get('/lab-tests', labCrud.list);
router.get('/lab-tests/:id', labCrud.getOne);
router.put('/lab-tests/:id', labCrud.update);
router.delete('/lab-tests/:id', labCrud.remove);

// ═══════════════════════════════════════════
//  PAYMENTS – full CRUD
// ═══════════════════════════════════════════
router.get('/payments', asyncHandler(async (req, res) => {
  const { page, limit, skip } = buildPagination(req.query);
  const where = {};
  if (req.query.status) where.status = req.query.status;
  if (req.query.search) where.transactionReference = { contains: req.query.search };
  const [data, total] = await Promise.all([
    prisma.payment.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' }, include: { patient: { include: { user: { select: { fullName: true } } } } } }),
    prisma.payment.count({ where }),
  ]);
  return paginatedResponse(res, { data, total, page, limit });
}));
router.get('/payments/:id', asyncHandler(async (req, res) => {
  const data = await prisma.payment.findUnique({ where: { id: parseInt(req.params.id) }, include: { patient: { include: { user: true } }, appointment: true } });
  if (!data) throw new NotFoundError('Payment not found');
  return successResponse(res, { data });
}));
router.put('/payments/:id', asyncHandler(async (req, res) => {
  const data = await prisma.payment.update({ where: { id: parseInt(req.params.id) }, data: req.body });
  createAuditLog({ actorId: req.user.id, entityType: 'Payment', entityId: data.id, action: 'UPDATE', newValues: req.body, req });
  return successResponse(res, { data });
}));
router.delete('/payments/:id', asyncHandler(async (req, res) => {
  await prisma.payment.update({ where: { id: parseInt(req.params.id) }, data: { status: 'REFUNDED' } });
  createAuditLog({ actorId: req.user.id, entityType: 'Payment', entityId: parseInt(req.params.id), action: 'DELETE', req });
  return successResponse(res, { data: null, message: 'Payment refunded' });
}));

// ═══════════════════════════════════════════
//  CLAIMS – full CRUD
// ═══════════════════════════════════════════
const claimCrud = crud('claimItem', {
  include: { 
    claimBatch: { include: { provider: true } }, 
    appointment: { include: { patient: { include: { user: true } } } } 
  },
  entityLabel: 'Claim',
  filterFn: (q) => ({ ...(q.status ? { status: q.status } : {}) })
});
router.get('/claims', claimCrud.list);
router.get('/claims/:id', claimCrud.getOne);
router.put('/claims/:id', claimCrud.update);
router.delete('/claims/:id', claimCrud.remove);

router.get('/claims/batches', asyncHandler(async (req, res) => {
  const { page, limit, skip } = buildPagination(req.query);
  const where = {};
  if (req.query.status) where.status = req.query.status;
  const [data, total] = await Promise.all([
    prisma.claimBatch.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' }, include: { provider: { select: { nameAr: true, nameEn: true } }, _count: { select: { items: true } } } }),
    prisma.claimBatch.count({ where }),
  ]);
  return paginatedResponse(res, { data, total, page, limit });
}));
router.get('/claims/batches/:id', asyncHandler(async (req, res) => {
  const data = await prisma.claimBatch.findUnique({ where: { id: parseInt(req.params.id) }, include: { provider: true, items: true } });
  if (!data) throw new NotFoundError('Claim batch not found');
  return successResponse(res, { data });
}));
router.post('/claims/batches', asyncHandler(async (req, res) => {
  const data = await prisma.claimBatch.create({ data: req.body });
  createAuditLog({ actorId: req.user.id, entityType: 'ClaimBatch', entityId: data.id, action: 'CREATE', newValues: req.body, req });
  return createdResponse(res, { data });
}));
router.put('/claims/batches/:id', asyncHandler(async (req, res) => {
  const data = await prisma.claimBatch.update({ where: { id: parseInt(req.params.id) }, data: req.body });
  createAuditLog({ actorId: req.user.id, entityType: 'ClaimBatch', entityId: data.id, action: 'UPDATE', newValues: req.body, req });
  return successResponse(res, { data });
}));
router.delete('/claims/batches/:id', asyncHandler(async (req, res) => {
  await prisma.claimBatch.delete({ where: { id: parseInt(req.params.id) } });
  createAuditLog({ actorId: req.user.id, entityType: 'ClaimBatch', entityId: parseInt(req.params.id), action: 'DELETE', req });
  return successResponse(res, { data: null, message: 'Claim batch deleted' });
}));

// ═══════════════════════════════════════════
//  RECONCILIATIONS – full CRUD
// ═══════════════════════════════════════════
const recCrud = crud('reconciliation', { include: { provider: { select: { nameAr: true, nameEn: true } } }, entityLabel: 'Reconciliation' });
router.get('/reconciliations', recCrud.list);
router.get('/reconciliations/:id', recCrud.getOne);
router.post('/reconciliations', recCrud.create);
router.put('/reconciliations/:id', recCrud.update);
router.delete('/reconciliations/:id', recCrud.remove);

// ═══════════════════════════════════════════
//  DOCTOR PAYOUTS – full CRUD
// ═══════════════════════════════════════════
const payoutCrud = crud('doctorPayout', { include: { doctor: { include: { user: { select: { fullName: true } } } } }, entityLabel: 'DoctorPayout', filterFn: (q) => ({ ...(q.status ? { status: q.status } : {}) }) });
router.get('/doctor-payouts', payoutCrud.list);
router.get('/doctor-payouts/:id', payoutCrud.getOne);
router.post('/doctor-payouts', payoutCrud.create);
router.put('/doctor-payouts/:id', payoutCrud.update);
router.delete('/doctor-payouts/:id', payoutCrud.remove);

// ═══════════════════════════════════════════
//  REPORTS – full CRUD
// ═══════════════════════════════════════════
const reportCrud = crud('medicalReport', { include: { patient: { include: { user: { select: { fullName: true } } } }, doctor: { include: { user: { select: { fullName: true } } } } }, entityLabel: 'MedicalReport' });
router.get('/reports', reportCrud.list);
router.get('/reports/:id', reportCrud.getOne);
router.put('/reports/:id', reportCrud.update);
router.delete('/reports/:id', reportCrud.remove);

// ═══════════════════════════════════════════
//  PRESCRIPTIONS – full CRUD
// ═══════════════════════════════════════════
const rxCrud = crud('prescription', { include: { items: true, patient: { include: { user: { select: { fullName: true } } } }, doctor: { include: { user: { select: { fullName: true } } } } }, entityLabel: 'Prescription' });
router.get('/prescriptions', rxCrud.list);
router.get('/prescriptions/:id', rxCrud.getOne);
router.put('/prescriptions/:id', rxCrud.update);
router.delete('/prescriptions/:id', rxCrud.remove);

// ═══════════════════════════════════════════
//  NOTIFICATIONS – full CRUD
// ═══════════════════════════════════════════
const notifCrud = crud('notification', { entityLabel: 'Notification' });
router.get('/notifications', notifCrud.list);
router.get('/notifications/:id', notifCrud.getOne);
router.post('/notifications', notifCrud.create);
router.put('/notifications/:id', notifCrud.update);
router.delete('/notifications/:id', notifCrud.remove);

// ═══════════════════════════════════════════
//  REVIEWS – full CRUD
// ═══════════════════════════════════════════
const reviewCrud = crud('review', {
  include: { patient: { include: { user: { select: { fullName: true } } } }, doctor: { include: { user: { select: { fullName: true } } } }, appointment: { select: { id: true, appointmentDate: true } } },
  entityLabel: 'Review',
});
router.get('/reviews', reviewCrud.list);
router.get('/reviews/:id', reviewCrud.getOne);
router.put('/reviews/:id', reviewCrud.update);
router.delete('/reviews/:id', reviewCrud.remove);

// ═══════════════════════════════════════════
//  SETTINGS – full CRUD
// ═══════════════════════════════════════════
router.get('/settings', asyncHandler(async (req, res) => {
  const data = await prisma.systemSetting.findMany({ orderBy: { key: 'asc' } });
  return successResponse(res, { data });
}));
router.get('/settings/:id', asyncHandler(async (req, res) => {
  const data = await prisma.systemSetting.findUnique({ where: { id: parseInt(req.params.id) } });
  if (!data) throw new NotFoundError('Setting not found');
  return successResponse(res, { data });
}));
router.post('/settings', asyncHandler(async (req, res) => {
  const data = await prisma.systemSetting.create({ data: req.body });
  createAuditLog({ actorId: req.user.id, entityType: 'SystemSetting', entityId: data.id, action: 'CREATE', newValues: req.body, req });
  return createdResponse(res, { data });
}));
router.put('/settings/:id', asyncHandler(async (req, res) => {
  const data = await prisma.systemSetting.update({ where: { id: parseInt(req.params.id) }, data: req.body });
  createAuditLog({ actorId: req.user.id, entityType: 'SystemSetting', entityId: data.id, action: 'UPDATE', newValues: req.body, req });
  return successResponse(res, { data });
}));
router.delete('/settings/:id', asyncHandler(async (req, res) => {
  await prisma.systemSetting.delete({ where: { id: parseInt(req.params.id) } });
  createAuditLog({ actorId: req.user.id, entityType: 'SystemSetting', entityId: parseInt(req.params.id), action: 'DELETE', req });
  return successResponse(res, { data: null, message: 'Setting deleted' });
}));

// ═══════════════════════════════════════════
//  AUDIT LOGS – read only
// ═══════════════════════════════════════════
router.get('/audit-logs', asyncHandler(async (req, res) => {
  const { page, limit, skip } = buildPagination(req.query);
  const where = {};
  if (req.query.entityType) where.entityType = req.query.entityType;
  if (req.query.action) where.action = req.query.action;
  if (req.query.actorId) where.actorId = parseInt(req.query.actorId);
  if (req.query.search) where.entityType = { contains: req.query.search };
  const [data, total] = await Promise.all([
    prisma.auditLog.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' }, include: { actor: { select: { fullName: true, email: true, role: true } } } }),
    prisma.auditLog.count({ where }),
  ]);
  return paginatedResponse(res, { data, total, page, limit });
}));

router.get('/audit-logs/:id', asyncHandler(async (req, res) => {
  const data = await prisma.auditLog.findUnique({ 
    where: { id: parseInt(req.params.id) }, 
    include: { actor: { select: { id: true, fullName: true, email: true, role: true } } } 
  });
  if (!data) throw new NotFoundError('Audit log not found');
  return successResponse(res, { data });
}));

// ═══════════════════════════════════════════
//  CHRONIC DISEASES – full CRUD
// ═══════════════════════════════════════════
const chronicDiseaseCrud = crud('chronicDisease', { searchFields: ['nameAr', 'nameEn'], entityLabel: 'ChronicDisease' });
router.get('/chronic-diseases', chronicDiseaseCrud.list);
router.get('/chronic-diseases/:id', chronicDiseaseCrud.getOne);
router.post('/chronic-diseases', chronicDiseaseCrud.create);
router.put('/chronic-diseases/:id', chronicDiseaseCrud.update);
router.delete('/chronic-diseases/:id', chronicDiseaseCrud.remove);

// ═══════════════════════════════════════════
//  ALLERGIES – full CRUD
// ═══════════════════════════════════════════
const allergyCrud = crud('allergy', { searchFields: ['nameAr', 'nameEn'], entityLabel: 'Allergy' });
router.get('/allergies', allergyCrud.list);
router.get('/allergies/:id', allergyCrud.getOne);
router.post('/allergies', allergyCrud.create);
router.put('/allergies/:id', allergyCrud.update);
router.delete('/allergies/:id', allergyCrud.remove);

// ═══════════════════════════════════════════
//  MEDICATIONS – full CRUD
// ═══════════════════════════════════════════
const medCrud = crud('medication', { searchFields: ['nameAr', 'nameEn'], entityLabel: 'Medication' });
router.get('/medications', medCrud.list);
router.get('/medications/:id', medCrud.getOne);
router.post('/medications', medCrud.create);
router.put('/medications/:id', medCrud.update);
router.delete('/medications/:id', medCrud.remove);

// ═══════════════════════════════════════════
//  MEDICAL TESTS – full CRUD
// ═══════════════════════════════════════════
const testCrud = crud('medicalTest', { searchFields: ['nameAr', 'nameEn', 'categoryAr', 'categoryEn'], entityLabel: 'MedicalTest' });
router.get('/medical-tests', testCrud.list);
router.get('/medical-tests/:id', testCrud.getOne);
router.post('/medical-tests', testCrud.create);
router.put('/medical-tests/:id', testCrud.update);
router.delete('/medical-tests/:id', testCrud.remove);

module.exports = router;

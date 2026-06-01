const router = require('express').Router();
const { authenticate } = require('../../middlewares/auth');
const { guard, MEDICAL, SUPPORT, INSURANCE, FINANCE, SUPER } = require('./admin.permissions');
const { asyncHandler } = require('../../utils/helpers');
const { successResponse, createdResponse, paginatedResponse } = require('../../shared/responses');
const { buildPagination } = require('../../utils/pagination');
const prisma = require('../../config/database');
const { ROLES } = require('../../constants');
const { NotFoundError } = require('../../shared/errors/AppError');
const { createAuditLog } = require('../../middlewares/auditLog');
const bcrypt = require('bcryptjs');
const MedicalProfileService = require('../medical-profile/medical-profile.service');
const { validate } = require('../../middlewares/validate');
const {
  updateMedicalProfileSchema,
  attachmentIdParamSchema,
  attachmentUploadBodySchema,
  patientIdParamSchema,
  patientIdFromIdParamSchema,
} = require('../medical-profile/medical-profile.validator');
const {
  medicalProfileAttachmentsUpload,
  getAttachmentTitlesFromBody,
} = require('../medical-profile/medical-profile.middleware');
const { mapMedicalProfile } = require('../../shared/utils/patientAppMappers');

const MEDICAL_PROFILE_INCLUDE = {
  chronicDiseases: { orderBy: { nameEn: 'asc' } },
  medications: { orderBy: { nameEn: 'asc' } },
  allergies: { orderBy: { nameEn: 'asc' } },
  attachments: { orderBy: { createdAt: 'desc' } },
};

router.use(authenticate);

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
router.get('/users', guard('users.list', ...MEDICAL), asyncHandler(async (req, res) => {
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
router.get('/users/:id', guard('users.read', ...MEDICAL), asyncHandler(async (req, res) => {
  const data = await prisma.user.findUnique({ where: { id: parseInt(req.params.id) }, select: { id: true, fullName: true, email: true, phone: true, role: true, status: true, isVerified: true, preferredLanguage: true, darkModeEnabled: true, avatarUrl: true, createdAt: true, lastLoginAt: true } });
  if (!data) throw new NotFoundError('User not found');
  return successResponse(res, { data });
}));
router.post('/users', guard('users.create', ...SUPER), asyncHandler(async (req, res) => {
  const passwordHash = await bcrypt.hash(req.body.password || 'Password123', 12);
  const { password, ...rest } = req.body;
  const data = await prisma.user.create({ data: { ...rest, passwordHash, isVerified: true }, select: { id: true, fullName: true, email: true, phone: true, role: true, status: true } });
  createAuditLog({ actorId: req.user.id, entityType: 'User', entityId: data.id, action: 'CREATE', newValues: { role: rest.role }, req });
  const { eventEmitter, EVENTS } = require('../../shared/events/eventEmitter');
  eventEmitter.emit(EVENTS.USER.REGISTERED, {
    id: data.id,
    fullName: data.fullName,
    role: data.role,
    email: data.email,
    phone: data.phone,
    source: 'ADMIN_CREATE',
  });
  return createdResponse(res, { data });
}));
router.put('/users/:id', guard('users.update', ...SUPER), asyncHandler(async (req, res) => {
  const { password, ...updateData } = req.body;
  if (password) updateData.passwordHash = await bcrypt.hash(password, 12);
  const data = await prisma.user.update({ where: { id: parseInt(req.params.id) }, data: updateData, select: { id: true, fullName: true, email: true, phone: true, role: true, status: true } });
  createAuditLog({ actorId: req.user.id, entityType: 'User', entityId: data.id, action: 'UPDATE', newValues: updateData, req });
  return successResponse(res, { data });
}));
router.delete('/users/:id', guard('users.delete', ...SUPER), asyncHandler(async (req, res) => {
  await prisma.user.update({ where: { id: parseInt(req.params.id) }, data: { deletedAt: new Date(), status: 'INACTIVE' } });
  createAuditLog({ actorId: req.user.id, entityType: 'User', entityId: parseInt(req.params.id), action: 'DELETE', req });
  return successResponse(res, { data: null, message: 'User deactivated' });
}));

// ═══════════════════════════════════════════
//  PATIENTS – full CRUD
// ═══════════════════════════════════════════
router.get('/patients', guard('patients.list', ...MEDICAL, ROLES.SUPPORT_STAFF), asyncHandler(async (req, res) => {
  const { page, limit, skip } = buildPagination(req.query);
  const where = {};
  if (req.query.search) where.user = { fullName: { contains: req.query.search } };
  const [data, total] = await Promise.all([
    prisma.patientProfile.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' }, include: { user: { select: { id: true, fullName: true, email: true, phone: true, status: true, isVerified: true } } } }),
    prisma.patientProfile.count({ where }),
  ]);
  return paginatedResponse(res, { data, total, page, limit });
}));
router.get('/patients/:id', guard('patients.read', ...MEDICAL, ROLES.SUPPORT_STAFF), asyncHandler(async (req, res) => {
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
  guard('patients.update', ...MEDICAL),
  validate(patientIdFromIdParamSchema, 'params'),
  validate(updateMedicalProfileSchema),
  asyncHandler(async (req, res) => {
    const data = await MedicalProfileService.updateByPatientId(req.params.id, req.body);
    return successResponse(res, { data, message: 'Medical profile updated' });
  }),
);

router.get(
  '/patients/:patientId/medical-profile/attachments',
  guard('patients.read', ...MEDICAL, ROLES.SUPPORT_STAFF),
  validate(patientIdParamSchema, 'params'),
  asyncHandler(async (req, res) => {
    const data = await MedicalProfileService.listAttachmentsByPatientId(req.params.patientId);
    return successResponse(res, { data });
  }),
);

router.post(
  '/patients/:patientId/medical-profile/attachments',
  guard('patients.update', ...MEDICAL),
  validate(patientIdParamSchema, 'params'),
  medicalProfileAttachmentsUpload,
  validate(attachmentUploadBodySchema),
  asyncHandler(async (req, res) => {
    const titles = getAttachmentTitlesFromBody(req.body);
    const attachments = await MedicalProfileService.addAttachmentsByPatientId(
      req.params.patientId,
      req.files,
      titles,
    );
    return createdResponse(res, { data: attachments, message: 'Attachments uploaded' });
  }),
);

router.delete(
  '/patients/:patientId/medical-profile/attachments/:id',
  guard('patients.update', ...MEDICAL),
  validate(patientIdParamSchema, 'params'),
  validate(attachmentIdParamSchema, 'params'),
  asyncHandler(async (req, res) => {
    const data = await MedicalProfileService.deleteAttachmentByPatientId(
      req.params.patientId,
      req.params.id,
    );
    return successResponse(res, { data, message: 'Attachment deleted' });
  }),
);
router.put('/patients/:id', guard('patients.update', ...MEDICAL), asyncHandler(async (req, res) => {
  const { userData, ...profileData } = req.body;
  const data = await prisma.patientProfile.update({ where: { id: parseInt(req.params.id) }, data: profileData });
  if (userData) {
    await prisma.user.update({ where: { id: data.userId }, data: userData });
  }
  createAuditLog({ actorId: req.user.id, entityType: 'PatientProfile', entityId: data.id, action: 'UPDATE', newValues: req.body, req });
  return successResponse(res, { data });
}));
router.delete('/patients/:id', guard('patients.delete', ...SUPER), asyncHandler(async (req, res) => {
  const pat = await prisma.patientProfile.findUnique({ where: { id: parseInt(req.params.id) } });
  if (pat) await prisma.user.update({ where: { id: pat.userId }, data: { deletedAt: new Date(), status: 'INACTIVE' } });
  createAuditLog({ actorId: req.user.id, entityType: 'PatientProfile', entityId: parseInt(req.params.id), action: 'DELETE', req });
  return successResponse(res, { data: null, message: 'Patient deactivated' });
}));

// ═══════════════════════════════════════════
//  SERVICES – full CRUD
// ═══════════════════════════════════════════
const svcCrud = crud('service', { searchFields: ['nameAr', 'nameEn'], entityLabel: 'Service', defaultOrder: { sortOrder: 'asc' } });
router.get('/services', guard('services.list', ...MEDICAL), svcCrud.list);
router.get('/services/:id', guard('services.read', ...MEDICAL), svcCrud.getOne);
router.post('/services', guard('services.create', ...MEDICAL), svcCrud.create);
router.put('/services/:id', guard('services.update', ...MEDICAL), svcCrud.update);
router.delete('/services/:id', guard('services.delete', ...SUPER), svcCrud.remove);

// ═══════════════════════════════════════════
//  INSURANCE PROVIDERS – full CRUD
// ═══════════════════════════════════════════
const ipCrud = crud('insuranceProvider', { searchFields: ['nameAr', 'nameEn', 'code'], entityLabel: 'InsuranceProvider' });
router.get('/insurance-providers', guard('insurance.providers.manage', ...SUPER), ipCrud.list);
router.get('/insurance-providers/:id', guard('insurance.providers.manage', ...SUPER), ipCrud.getOne);
router.post('/insurance-providers', guard('insurance.providers.manage', ...SUPER), ipCrud.create);
router.put('/insurance-providers/:id', guard('insurance.providers.manage', ...SUPER), ipCrud.update);
router.delete('/insurance-providers/:id', guard('insurance.providers.manage', ...SUPER), ipCrud.remove);

// ═══════════════════════════════════════════
//  APPOINTMENTS – full CRUD
// ═══════════════════════════════════════════
router.get('/appointments', guard('appointments.list', ...MEDICAL), asyncHandler(async (req, res) => {
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
router.get('/appointments/:id', guard('appointments.read', ...MEDICAL, ROLES.SUPPORT_STAFF), asyncHandler(async (req, res) => {
  const data = await prisma.appointment.findUnique({ where: { id: parseInt(req.params.id) }, include: { patient: { include: { user: true } }, doctor: { include: { user: true, speciality: true } }, service: true, attachments: true, prescriptions: true, reports: true } });
  if (!data) throw new NotFoundError('Appointment not found');
  return successResponse(res, { data });
}));
router.put('/appointments/:id', guard('appointments.update', ...MEDICAL), asyncHandler(async (req, res) => {
  const data = await prisma.appointment.update({ where: { id: parseInt(req.params.id) }, data: req.body });
  createAuditLog({ actorId: req.user.id, entityType: 'Appointment', entityId: data.id, action: 'UPDATE', newValues: req.body, req });
  return successResponse(res, { data });
}));
router.delete('/appointments/:id', guard('appointments.delete', ...SUPER), asyncHandler(async (req, res) => {
  await prisma.appointment.update({ where: { id: parseInt(req.params.id) }, data: { status: 'CANCELLED', cancellationReason: 'Cancelled by admin' } });
  createAuditLog({ actorId: req.user.id, entityType: 'Appointment', entityId: parseInt(req.params.id), action: 'DELETE', req });
  return successResponse(res, { data: null, message: 'Appointment cancelled' });
}));

// ═══════════════════════════════════════════
//  INSURANCE CASES – full CRUD + workflow
// ═══════════════════════════════════════════
const InsuranceCaseService = require('../insurance-cases/insuranceCase.service');
const InsuranceRequestOrchestrator = require('../insurance-cases/insuranceRequest.orchestrator');

const INSURANCE_CASE_ADMIN_INCLUDE = InsuranceRequestOrchestrator.caseInclude();

router.get('/insurance-cases', guard('insurance.cases.list', ...INSURANCE), asyncHandler(async (req, res) => {
  const { data, total, page, limit } = await InsuranceCaseService.list(req.query);
  return paginatedResponse(res, { data, total, page, limit });
}));
router.get('/insurance-cases/:id', guard('insurance.cases.read', ...INSURANCE), asyncHandler(async (req, res) => {
  const data = await InsuranceCaseService.getById(req.params.id);
  return successResponse(res, { data });
}));
router.put('/insurance-cases/:id', guard('insurance.cases.update', ...INSURANCE), asyncHandler(async (req, res) => {
  const data = await prisma.insuranceCase.update({ where: { id: parseInt(req.params.id) }, data: req.body });
  createAuditLog({ actorId: req.user.id, entityType: 'InsuranceCase', entityId: data.id, action: 'UPDATE', newValues: req.body, req });
  return successResponse(res, { data });
}));
router.patch('/insurance-cases/:id/approve', guard('insurance.cases.decide', ...INSURANCE), asyncHandler(async (req, res) => {
  const data = await InsuranceCaseService.approve(req.params.id, req.body, req.user.id, req);
  return successResponse(res, { data, message: 'Insurance case approved' });
}));
router.patch('/insurance-cases/:id/reject', guard('insurance.cases.decide', ...INSURANCE), asyncHandler(async (req, res) => {
  const data = await InsuranceCaseService.reject(req.params.id, req.body, req.user.id, req);
  return successResponse(res, { data, message: 'Insurance case rejected' });
}));
router.patch('/insurance-cases/:id/request-info', guard('insurance.cases.decide', ...INSURANCE), asyncHandler(async (req, res) => {
  const data = await InsuranceCaseService.requestInfo(req.params.id, req.body, req.user.id, req);
  return successResponse(res, { data, message: 'More information requested' });
}));
router.patch('/insurance-cases/:id/escalate', guard('insurance.cases.update', ...INSURANCE), asyncHandler(async (req, res) => {
  const data = await InsuranceCaseService.escalate(req.params.id, req.body, req.user.id, req);
  return successResponse(res, { data, message: 'Case escalated' });
}));
router.patch('/insurance-cases/:id/approval', guard('insurance.cases.decide', ...INSURANCE), asyncHandler(async (req, res) => {
  const data = await InsuranceCaseService.updateApproval(req.params.id, req.body, req.user.id, req);
  return successResponse(res, { data, message: 'Insurance approval updated' });
}));
router.delete('/insurance-cases/:id', guard('insurance.cases.delete', ...INSURANCE), asyncHandler(async (req, res) => {
  await prisma.insuranceCase.update({ where: { id: parseInt(req.params.id) }, data: { status: 'CLOSED', resolvedAt: new Date() } });
  createAuditLog({ actorId: req.user.id, entityType: 'InsuranceCase', entityId: parseInt(req.params.id), action: 'DELETE', req });
  return successResponse(res, { data: null, message: 'Insurance case closed' });
}));

router.get('/patients/:id/insurances', guard('patients.insurance.read', ...MEDICAL, ...INSURANCE, ROLES.SUPPORT_STAFF), asyncHandler(async (req, res) => {
  const data = await prisma.patientInsurance.findMany({
    where: { patientId: parseInt(req.params.id, 10) },
    include: { provider: true },
    orderBy: [{ isPrimary: 'desc' }, { createdAt: 'desc' }],
  });
  return successResponse(res, { data });
}));
router.patch('/patients/:id/insurances/:insuranceId/verify', guard('patients.insurance.verify', ...INSURANCE), asyncHandler(async (req, res) => {
  const patientId = parseInt(req.params.id, 10);
  const insuranceId = parseInt(req.params.insuranceId, 10);
  const existing = await prisma.patientInsurance.findFirst({ where: { id: insuranceId, patientId } });
  if (!existing) throw new NotFoundError('Patient insurance not found');
  const data = await prisma.patientInsurance.update({
    where: { id: insuranceId },
    data: { verificationStatus: req.body.verificationStatus },
    include: { provider: true },
  });
  createAuditLog({ actorId: req.user.id, entityType: 'PatientInsurance', entityId: data.id, action: 'VERIFY', newValues: req.body, req });
  return successResponse(res, { data });
}));

// ═══════════════════════════════════════════
//  SUPPORT CASES – legacy aliases (see /admin/support)
// ═══════════════════════════════════════════
const supportAdmin = require('../support/support.admin.controller');
router.get('/support-cases', guard('support.cases.list', ...SUPPORT), supportAdmin.listTickets);
router.get('/support-cases/:id', guard('support.cases.read', ...SUPPORT), supportAdmin.getTicket);
router.patch('/support-cases/:id', guard('support.cases.manage', ...SUPPORT), supportAdmin.updateStatus);
router.delete('/support-cases/:id', guard('support.cases.manage', ...SUPPORT), asyncHandler(async (req, res) => {
  await require('../support/supportTicket.service').updateStatus(
    req.params.id,
    { status: 'CLOSED', resolutionNotes: 'Closed by admin' },
    req.user.id,
  );
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
router.get('/lab-tests', guard('lab-tests.list', ...MEDICAL), labCrud.list);
router.get('/lab-tests/:id', guard('lab-tests.read', ...MEDICAL), labCrud.getOne);
router.put('/lab-tests/:id', guard('lab-tests.update', ...MEDICAL), labCrud.update);
router.delete('/lab-tests/:id', guard('lab-tests.delete', ...SUPER), labCrud.remove);

// ═══════════════════════════════════════════
//  PAYMENTS – full CRUD
// ═══════════════════════════════════════════
router.get('/payments', guard('payments.list', ...FINANCE), asyncHandler(async (req, res) => {
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
router.get('/payments/:id', guard('payments.read', ...FINANCE), asyncHandler(async (req, res) => {
  const data = await prisma.payment.findUnique({ where: { id: parseInt(req.params.id) }, include: { patient: { include: { user: true } }, appointment: true } });
  if (!data) throw new NotFoundError('Payment not found');
  return successResponse(res, { data });
}));
router.put('/payments/:id', guard('payments.update', ...FINANCE), asyncHandler(async (req, res) => {
  const data = await prisma.payment.update({ where: { id: parseInt(req.params.id) }, data: req.body });
  createAuditLog({ actorId: req.user.id, entityType: 'Payment', entityId: data.id, action: 'UPDATE', newValues: req.body, req });
  return successResponse(res, { data });
}));
router.delete('/payments/:id', guard('payments.delete', ...SUPER), asyncHandler(async (req, res) => {
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
router.get('/claims', guard('claims.list', ...FINANCE), claimCrud.list);
router.get('/claims/:id', guard('claims.list', ...FINANCE), claimCrud.getOne);
router.put('/claims/:id', guard('claims.manage', ...FINANCE), claimCrud.update);
router.delete('/claims/:id', guard('claims.manage', ...FINANCE), claimCrud.remove);

router.get('/claims/batches', guard('claims.list', ...FINANCE), asyncHandler(async (req, res) => {
  const { page, limit, skip } = buildPagination(req.query);
  const where = {};
  if (req.query.status) where.status = req.query.status;
  const [data, total] = await Promise.all([
    prisma.claimBatch.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' }, include: { provider: { select: { nameAr: true, nameEn: true } }, _count: { select: { items: true } } } }),
    prisma.claimBatch.count({ where }),
  ]);
  return paginatedResponse(res, { data, total, page, limit });
}));
router.get('/claims/batches/:id', guard('claims.list', ...FINANCE), asyncHandler(async (req, res) => {
  const data = await prisma.claimBatch.findUnique({ where: { id: parseInt(req.params.id) }, include: { provider: true, items: true } });
  if (!data) throw new NotFoundError('Claim batch not found');
  return successResponse(res, { data });
}));
router.post('/claims/batches', guard('claims.manage', ...FINANCE), asyncHandler(async (req, res) => {
  const data = await prisma.claimBatch.create({ data: req.body });
  createAuditLog({ actorId: req.user.id, entityType: 'ClaimBatch', entityId: data.id, action: 'CREATE', newValues: req.body, req });
  return createdResponse(res, { data });
}));
router.put('/claims/batches/:id', guard('claims.manage', ...FINANCE), asyncHandler(async (req, res) => {
  const data = await prisma.claimBatch.update({ where: { id: parseInt(req.params.id) }, data: req.body });
  createAuditLog({ actorId: req.user.id, entityType: 'ClaimBatch', entityId: data.id, action: 'UPDATE', newValues: req.body, req });
  return successResponse(res, { data });
}));
router.delete('/claims/batches/:id', guard('claims.manage', ...FINANCE), asyncHandler(async (req, res) => {
  await prisma.claimBatch.delete({ where: { id: parseInt(req.params.id) } });
  createAuditLog({ actorId: req.user.id, entityType: 'ClaimBatch', entityId: parseInt(req.params.id), action: 'DELETE', req });
  return successResponse(res, { data: null, message: 'Claim batch deleted' });
}));

// ═══════════════════════════════════════════
//  RECONCILIATIONS – full CRUD
// ═══════════════════════════════════════════
const recCrud = crud('reconciliation', { include: { provider: { select: { nameAr: true, nameEn: true } } }, entityLabel: 'Reconciliation' });
router.get('/reconciliations', guard('reconciliations.manage', ...FINANCE), recCrud.list);
router.get('/reconciliations/:id', guard('reconciliations.manage', ...FINANCE), recCrud.getOne);
router.post('/reconciliations', guard('reconciliations.manage', ...FINANCE), recCrud.create);
router.put('/reconciliations/:id', guard('reconciliations.manage', ...FINANCE), recCrud.update);
router.delete('/reconciliations/:id', guard('reconciliations.manage', ...FINANCE), recCrud.remove);

// ═══════════════════════════════════════════
//  DOCTOR PAYOUTS – full CRUD
// ═══════════════════════════════════════════
const payoutCrud = crud('doctorPayout', { include: { doctor: { include: { user: { select: { fullName: true } } } } }, entityLabel: 'DoctorPayout', filterFn: (q) => ({ ...(q.status ? { status: q.status } : {}) }) });
router.get('/doctor-payouts', guard('payouts.manage', ...FINANCE), payoutCrud.list);
router.get('/doctor-payouts/:id', guard('payouts.manage', ...FINANCE), payoutCrud.getOne);
router.post('/doctor-payouts', guard('payouts.manage', ...FINANCE), payoutCrud.create);
router.put('/doctor-payouts/:id', guard('payouts.manage', ...FINANCE), payoutCrud.update);
router.delete('/doctor-payouts/:id', guard('payouts.manage', ...FINANCE), payoutCrud.remove);

// ═══════════════════════════════════════════
//  REPORTS – full CRUD
// ═══════════════════════════════════════════
const reportCrud = crud('medicalReport', { include: { patient: { include: { user: { select: { fullName: true } } } }, doctor: { include: { user: { select: { fullName: true } } } } }, entityLabel: 'MedicalReport' });
router.get('/reports', guard('reports.admin.list', ...MEDICAL), reportCrud.list);
router.get('/reports/:id', guard('reports.admin.list', ...MEDICAL), reportCrud.getOne);
router.put('/reports/:id', guard('reports.admin.update', ...MEDICAL), reportCrud.update);
router.delete('/reports/:id', guard('reports.admin.delete', ...SUPER), reportCrud.remove);

// ═══════════════════════════════════════════
//  PRESCRIPTIONS – full CRUD
// ═══════════════════════════════════════════
const rxCrud = crud('prescription', { include: { items: true, patient: { include: { user: { select: { fullName: true } } } }, doctor: { include: { user: { select: { fullName: true } } } } }, entityLabel: 'Prescription' });
router.get('/prescriptions', guard('prescriptions.admin.list', ...MEDICAL), rxCrud.list);
router.get('/prescriptions/:id', guard('prescriptions.admin.list', ...MEDICAL), rxCrud.getOne);
router.put('/prescriptions/:id', guard('prescriptions.admin.update', ...MEDICAL), rxCrud.update);
router.delete('/prescriptions/:id', guard('prescriptions.admin.delete', ...SUPER), rxCrud.remove);

// ═══════════════════════════════════════════
//  NOTIFICATIONS – full CRUD
// ═══════════════════════════════════════════
const notifCrud = crud('notification', { entityLabel: 'Notification' });
router.get('/notifications', guard('notifications.admin.manage', ...SUPER), notifCrud.list);
router.get('/notifications/:id', guard('notifications.admin.manage', ...SUPER), notifCrud.getOne);
router.post('/notifications', guard('notifications.admin.send', ...SUPER), notifCrud.create);
router.put('/notifications/:id', guard('notifications.admin.manage', ...SUPER), notifCrud.update);
router.delete('/notifications/:id', guard('notifications.admin.manage', ...SUPER), notifCrud.remove);

// ═══════════════════════════════════════════
//  REVIEWS – full CRUD
// ═══════════════════════════════════════════
const reviewCrud = crud('review', {
  include: { patient: { include: { user: { select: { fullName: true } } } }, doctor: { include: { user: { select: { fullName: true } } } }, appointment: { select: { id: true, appointmentDate: true } } },
  entityLabel: 'Review',
});
router.get('/reviews', guard('reviews.moderate', ...MEDICAL), reviewCrud.list);
router.get('/reviews/:id', guard('reviews.moderate', ...MEDICAL), reviewCrud.getOne);
router.put('/reviews/:id', guard('reviews.moderate', ...MEDICAL), reviewCrud.update);
router.delete('/reviews/:id', guard('reviews.moderate', ...MEDICAL), reviewCrud.remove);

// ═══════════════════════════════════════════
//  SETTINGS – full CRUD
// ═══════════════════════════════════════════
router.get('/settings', guard('settings.manage', ...SUPER), asyncHandler(async (req, res) => {
  const data = await prisma.systemSetting.findMany({ orderBy: { key: 'asc' } });
  return successResponse(res, { data });
}));
router.get('/settings/:id', guard('settings.manage', ...SUPER), asyncHandler(async (req, res) => {
  const data = await prisma.systemSetting.findUnique({ where: { id: parseInt(req.params.id) } });
  if (!data) throw new NotFoundError('Setting not found');
  return successResponse(res, { data });
}));
router.post('/settings', guard('settings.manage', ...SUPER), asyncHandler(async (req, res) => {
  const data = await prisma.systemSetting.create({ data: req.body });
  createAuditLog({ actorId: req.user.id, entityType: 'SystemSetting', entityId: data.id, action: 'CREATE', newValues: req.body, req });
  return createdResponse(res, { data });
}));
router.put('/settings/:id', guard('settings.manage', ...SUPER), asyncHandler(async (req, res) => {
  const data = await prisma.systemSetting.update({ where: { id: parseInt(req.params.id) }, data: req.body });
  createAuditLog({ actorId: req.user.id, entityType: 'SystemSetting', entityId: data.id, action: 'UPDATE', newValues: req.body, req });
  return successResponse(res, { data });
}));
router.delete('/settings/:id', guard('settings.manage', ...SUPER), asyncHandler(async (req, res) => {
  await prisma.systemSetting.delete({ where: { id: parseInt(req.params.id) } });
  createAuditLog({ actorId: req.user.id, entityType: 'SystemSetting', entityId: parseInt(req.params.id), action: 'DELETE', req });
  return successResponse(res, { data: null, message: 'Setting deleted' });
}));

// ═══════════════════════════════════════════
//  AUDIT LOGS – read only
// ═══════════════════════════════════════════
router.get('/audit-logs', guard('audit.view', ...SUPER), asyncHandler(async (req, res) => {
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

router.get('/audit-logs/:id', guard('audit.view', ...SUPER), asyncHandler(async (req, res) => {
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
router.get('/chronic-diseases', guard('medical-master.list', ...MEDICAL), chronicDiseaseCrud.list);
router.get('/chronic-diseases/:id', guard('medical-master.list', ...MEDICAL), chronicDiseaseCrud.getOne);
router.post('/chronic-diseases', guard('medical-master.create', ...MEDICAL), chronicDiseaseCrud.create);
router.put('/chronic-diseases/:id', guard('medical-master.update', ...MEDICAL), chronicDiseaseCrud.update);
router.delete('/chronic-diseases/:id', guard('medical-master.delete', ...SUPER), chronicDiseaseCrud.remove);

// ═══════════════════════════════════════════
//  ALLERGIES – full CRUD
// ═══════════════════════════════════════════
const allergyCrud = crud('allergy', { searchFields: ['nameAr', 'nameEn'], entityLabel: 'Allergy' });
router.get('/allergies', guard('medical-master.list', ...MEDICAL), allergyCrud.list);
router.get('/allergies/:id', guard('medical-master.list', ...MEDICAL), allergyCrud.getOne);
router.post('/allergies', guard('medical-master.create', ...MEDICAL), allergyCrud.create);
router.put('/allergies/:id', guard('medical-master.update', ...MEDICAL), allergyCrud.update);
router.delete('/allergies/:id', guard('medical-master.delete', ...SUPER), allergyCrud.remove);

// ═══════════════════════════════════════════
//  MEDICATIONS – full CRUD
// ═══════════════════════════════════════════
const medCrud = crud('medication', { searchFields: ['nameAr', 'nameEn'], entityLabel: 'Medication' });
router.get('/medications', guard('medical-master.list', ...MEDICAL), medCrud.list);
router.get('/medications/:id', guard('medical-master.list', ...MEDICAL), medCrud.getOne);
router.post('/medications', guard('medical-master.create', ...MEDICAL), medCrud.create);
router.put('/medications/:id', guard('medical-master.update', ...MEDICAL), medCrud.update);
router.delete('/medications/:id', guard('medical-master.delete', ...SUPER), medCrud.remove);

// ═══════════════════════════════════════════
//  MEDICAL TESTS – full CRUD
// ═══════════════════════════════════════════
const testCrud = crud('medicalTest', { searchFields: ['nameAr', 'nameEn', 'categoryAr', 'categoryEn'], entityLabel: 'MedicalTest' });
router.get('/medical-tests', guard('medical-master.list', ...MEDICAL), testCrud.list);
router.get('/medical-tests/:id', guard('medical-master.list', ...MEDICAL), testCrud.getOne);
router.post('/medical-tests', guard('medical-master.create', ...MEDICAL), testCrud.create);
router.put('/medical-tests/:id', guard('medical-master.update', ...MEDICAL), testCrud.update);
router.delete('/medical-tests/:id', guard('medical-master.delete', ...SUPER), testCrud.remove);

module.exports = router;

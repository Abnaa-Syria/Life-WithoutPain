const router = require('express').Router();
const { authenticate } = require('../../middlewares/auth');
const { guard, MEDICAL, SUPPORT, INSURANCE, FINANCE, SUPER } = require('./admin.permissions');
const { asyncHandler } = require('../../utils/helpers');
const { successResponse, createdResponse, paginatedResponse } = require('../../shared/responses');
const { buildPagination } = require('../../utils/pagination');
const prisma = require('../../config/database');
const { ROLES } = require('../../constants');
const { NotFoundError, BadRequestError } = require('../../shared/errors/AppError');
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
const PatientService = require('../patients/patient.service');
const { enrichInsuranceProvidersOnRecords, enrichAppointments, enrichMedicalProfile } = require('../../i18n/enrichRelations');

const MEDICAL_PROFILE_INCLUDE = {
  chronicDiseases: { orderBy: { id: 'asc' } },
  medications: { orderBy: { id: 'asc' } },
  allergies: { orderBy: { id: 'asc' } },
  attachments: { orderBy: { createdAt: 'desc' } },
};

const APPOINTMENT_PREVIEW_INCLUDE = {
  select: {
    id: true,
    appointmentDate: true,
    startTime: true,
    endTime: true,
    status: true,
    appointmentType: true,
    amount: true,
    patient: { include: { user: { select: { fullName: true } } } },
    doctor: { include: { user: { select: { fullName: true } }, speciality: true } },
    service: true,
  },
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
    if (!data) throw new NotFoundError('ENTITY_NOT_FOUND', { entityLabel });
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
  if (!data) throw new NotFoundError('USER_NOT_FOUND');
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
      prescriptions: {
        include: {
          items: true,
          appointment: APPOINTMENT_PREVIEW_INCLUDE,
          doctor: { include: { user: { select: { fullName: true } } } },
        },
        orderBy: { createdAt: 'desc' },
      },
      reports: {
        include: {
          appointment: APPOINTMENT_PREVIEW_INCLUDE,
          doctor: { include: { user: { select: { fullName: true } } } },
        },
        orderBy: { createdAt: 'desc' },
      },
      labTests: {
        include: {
          appointment: APPOINTMENT_PREVIEW_INCLUDE,
          doctor: { include: { user: { select: { fullName: true } } } },
          results: true,
        },
        orderBy: { requestedAt: 'desc' },
      },
      appointments: {
        include: {
          doctor: { include: { user: { select: { fullName: true } }, speciality: true } },
          service: true,
        },
        orderBy: { appointmentDate: 'desc' },
        take: 50,
      },
      medicalFiles: true
    } 
  });
  if (!data) throw new NotFoundError('PATIENT_NOT_FOUND');
  const [insurances, appointments, medicalProfile] = await Promise.all([
    enrichInsuranceProvidersOnRecords(data.insurances, req.locale),
    enrichAppointments(data.appointments, req.locale),
    data.medicalProfile ? enrichMedicalProfile(data.medicalProfile, req.locale) : null,
  ]);
  const response = {
    ...data,
    insurances,
    appointments,
    medicalProfile: medicalProfile ? mapMedicalProfile(medicalProfile) : null,
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
const svcCrud = crud('service', { entityLabel: 'Service', defaultOrder: { sortOrder: 'asc' } });
router.get('/services', guard('services.list', ...MEDICAL), svcCrud.list);
router.get('/services/:id', guard('services.read', ...MEDICAL), svcCrud.getOne);
router.post('/services', guard('services.create', ...MEDICAL), svcCrud.create);
router.put('/services/:id', guard('services.update', ...MEDICAL), svcCrud.update);
router.delete('/services/:id', guard('services.delete', ...SUPER), svcCrud.remove);

// ═══════════════════════════════════════════
//  INSURANCE PROVIDERS – full CRUD
// ═══════════════════════════════════════════
const ipCrud = crud('insuranceProvider', { searchFields: ['code'], entityLabel: 'InsuranceProvider' });
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
  if (req.query.patientId) where.patientId = parseInt(req.query.patientId, 10);
  if (req.query.doctorId) where.doctorId = parseInt(req.query.doctorId, 10);
  if (req.query.date) where.appointmentDate = new Date(req.query.date);
  if (req.query.search) where.OR = [{ patient: { user: { fullName: { contains: req.query.search } } } }, { doctor: { user: { fullName: { contains: req.query.search } } } }];
  const [data, total] = await Promise.all([
    prisma.appointment.findMany({ where, skip, take: limit, orderBy: { appointmentDate: 'desc' }, include: { patient: { include: { user: { select: { fullName: true } } } }, doctor: { include: { user: { select: { fullName: true } }, speciality: true } }, service: true } }),
    prisma.appointment.count({ where }),
  ]);
  const enriched = await enrichAppointments(data, req.locale);
  return paginatedResponse(res, { data: enriched, total, page, limit });
}));
router.get('/appointments/:id', guard('appointments.read', ...MEDICAL, ROLES.SUPPORT_STAFF), asyncHandler(async (req, res) => {
  const data = await prisma.appointment.findUnique({
    where: { id: parseInt(req.params.id) },
    include: {
      patient: { include: { user: true } },
      doctor: { include: { user: true, speciality: true } },
      service: true,
      attachments: true,
      prescriptions: { include: { items: true }, orderBy: { createdAt: 'desc' } },
      reports: { orderBy: { createdAt: 'desc' } },
      labTests: { include: { results: true }, orderBy: { requestedAt: 'desc' } },
    },
  });
  if (!data) throw new NotFoundError('APPOINTMENT_NOT_FOUND');
  return successResponse(res, { data });
}));
router.patch('/appointments/:id/status', guard('appointments.update', ...MEDICAL), asyncHandler(async (req, res) => {
  const AppointmentService = require('../appointments/appointment.service');
  const { status, reason, newDate, newStartTime, newEndTime } = req.body;
  if (!status) throw new BadRequestError('STATUS_REQUIRED');
  const data = await AppointmentService.updateStatus(
    req.params.id,
    status,
    req.user.id,
    { reason, newDate, newStartTime, newEndTime },
  );
  createAuditLog({ actorId: req.user.id, entityType: 'Appointment', entityId: data.id, action: 'STATUS_CHANGE', newValues: { status }, req });
  return successResponse(res, { data });
}));
router.put('/appointments/:id', guard('appointments.update', ...MEDICAL), asyncHandler(async (req, res) => {
  const data = await prisma.appointment.update({ where: { id: parseInt(req.params.id) }, data: req.body });
  createAuditLog({ actorId: req.user.id, entityType: 'Appointment', entityId: data.id, action: 'UPDATE', newValues: req.body, req });
  return successResponse(res, { data });
}));
router.delete('/appointments/:id', guard('appointments.delete', ...SUPER), asyncHandler(async (req, res) => {
  const AppointmentService = require('../appointments/appointment.service');
  const data = await AppointmentService.updateStatus(
    req.params.id,
    'CANCELLED',
    req.user.id,
    { reason: 'Cancelled by admin' },
  );
  createAuditLog({ actorId: req.user.id, entityType: 'Appointment', entityId: data.id, action: 'DELETE', req });
  return successResponse(res, { data: null, messageKey: 'APPOINTMENT_CANCELLED' });
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
  return successResponse(res, { data, messageKey: 'INSURANCE_CASE_APPROVED' });
}));
router.patch('/insurance-cases/:id/reject', guard('insurance.cases.decide', ...INSURANCE), asyncHandler(async (req, res) => {
  const data = await InsuranceCaseService.reject(req.params.id, req.body, req.user.id, req);
  return successResponse(res, { data, messageKey: 'INSURANCE_CASE_REJECTED' });
}));
router.patch('/insurance-cases/:id/request-info', guard('insurance.cases.decide', ...INSURANCE), asyncHandler(async (req, res) => {
  const data = await InsuranceCaseService.requestInfo(req.params.id, req.body, req.user.id, req);
  return successResponse(res, { data, messageKey: 'INSURANCE_MORE_INFO' });
}));
router.patch('/insurance-cases/:id/escalate', guard('insurance.cases.update', ...INSURANCE), asyncHandler(async (req, res) => {
  const data = await InsuranceCaseService.escalate(req.params.id, req.body, req.user.id, req);
  return successResponse(res, { data, messageKey: 'CASE_ESCALATED' });
}));
router.patch('/insurance-cases/:id/approval', guard('insurance.cases.decide', ...INSURANCE), asyncHandler(async (req, res) => {
  const data = await InsuranceCaseService.updateApproval(req.params.id, req.body, req.user.id, req);
  return successResponse(res, { data, messageKey: 'INSURANCE_APPROVAL_UPDATED' });
}));
router.delete('/insurance-cases/:id', guard('insurance.cases.delete', ...INSURANCE), asyncHandler(async (req, res) => {
  await prisma.insuranceCase.update({ where: { id: parseInt(req.params.id) }, data: { status: 'CLOSED', resolvedAt: new Date() } });
  createAuditLog({ actorId: req.user.id, entityType: 'InsuranceCase', entityId: parseInt(req.params.id), action: 'DELETE', req });
  return successResponse(res, { data: null, message: 'Insurance case closed' });
}));

router.get('/patients/:id/insurances', guard('patients.insurance.read', ...MEDICAL, ...INSURANCE, ROLES.SUPPORT_STAFF), asyncHandler(async (req, res) => {
  const data = await prisma.patientInsurance.findMany({
    where: { patientId: parseInt(req.params.id, 10) },
    include: { provider: { select: { id: true, code: true, logoUrl: true } } },
    orderBy: [{ isPrimary: 'desc' }, { createdAt: 'desc' }],
  });
  const enriched = await PatientService.withLocalizedProviders(data, req.locale);
  return successResponse(res, { data: enriched });
}));
router.patch('/patients/:id/insurances/:insuranceId/verify', guard('patients.insurance.verify', ...INSURANCE), asyncHandler(async (req, res) => {
  const patientId = parseInt(req.params.id, 10);
  const insuranceId = parseInt(req.params.insuranceId, 10);
  const existing = await prisma.patientInsurance.findFirst({ where: { id: insuranceId, patientId } });
  if (!existing) throw new NotFoundError('PATIENT_INSURANCE_NOT_FOUND');
  const data = await prisma.patientInsurance.update({
    where: { id: insuranceId },
    data: { verificationStatus: req.body.verificationStatus },
    include: { provider: { select: { id: true, code: true, logoUrl: true } } },
  });
  createAuditLog({ actorId: req.user.id, entityType: 'PatientInsurance', entityId: data.id, action: 'VERIFY', newValues: req.body, req });
  const enriched = await PatientService.withLocalizedProviders(data, req.locale);
  return successResponse(res, { data: enriched });
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
  include: {
    patient: { include: { user: { select: { fullName: true } } } },
    doctor: { include: { user: { select: { fullName: true } } } },
    appointment: APPOINTMENT_PREVIEW_INCLUDE,
    results: true,
  },
  filterFn: (q) => ({
    ...(q.status ? { status: q.status } : {}),
    ...(q.patientId ? { patientId: parseInt(q.patientId, 10) } : {}),
    ...(q.doctorId ? { doctorId: parseInt(q.doctorId, 10) } : {}),
  }),
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
  if (!data) throw new NotFoundError('PAYMENT_NOT_FOUND');
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
    prisma.claimBatch.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' }, include: { provider: true, _count: { select: { items: true } } } }),
    prisma.claimBatch.count({ where }),
  ]);
  const enriched = await enrichInsuranceProvidersOnRecords(data, req.locale);
  return paginatedResponse(res, { data: enriched, total, page, limit });
}));
router.get('/claims/batches/:id', guard('claims.list', ...FINANCE), asyncHandler(async (req, res) => {
  const data = await prisma.claimBatch.findUnique({ where: { id: parseInt(req.params.id) }, include: { provider: true, items: true } });
  if (!data) throw new NotFoundError('CLAIM_BATCH_NOT_FOUND');
  const enriched = await enrichInsuranceProvidersOnRecords(data, req.locale);
  return successResponse(res, { data: enriched });
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
const recCrud = crud('reconciliation', { include: { provider: true }, entityLabel: 'Reconciliation' });
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
const reportCrud = crud('medicalReport', {
  include: {
    patient: { include: { user: { select: { fullName: true } } } },
    doctor: { include: { user: { select: { fullName: true } } } },
    appointment: APPOINTMENT_PREVIEW_INCLUDE,
    prescription: { select: { id: true, diagnosis: true } },
    attachments: true,
  },
  entityLabel: 'MedicalReport',
  filterFn: (q) => ({
    ...(q.patientId ? { patientId: parseInt(q.patientId, 10) } : {}),
    ...(q.doctorId ? { doctorId: parseInt(q.doctorId, 10) } : {}),
  }),
});
router.get('/reports', guard('reports.admin.list', ...MEDICAL), reportCrud.list);
router.get('/reports/:id', guard('reports.admin.list', ...MEDICAL), reportCrud.getOne);
router.put('/reports/:id', guard('reports.admin.update', ...MEDICAL), reportCrud.update);
router.delete('/reports/:id', guard('reports.admin.delete', ...SUPER), reportCrud.remove);

// ═══════════════════════════════════════════
//  PRESCRIPTIONS – full CRUD
// ═══════════════════════════════════════════
const rxCrud = crud('prescription', {
  include: {
    items: true,
    patient: { include: { user: { select: { fullName: true } } } },
    doctor: { include: { user: { select: { fullName: true } } } },
    appointment: APPOINTMENT_PREVIEW_INCLUDE,
  },
  entityLabel: 'Prescription',
  filterFn: (q) => ({
    ...(q.patientId ? { patientId: parseInt(q.patientId, 10) } : {}),
    ...(q.doctorId ? { doctorId: parseInt(q.doctorId, 10) } : {}),
  }),
});
router.get('/prescriptions', guard('prescriptions.admin.list', ...MEDICAL), rxCrud.list);
router.get('/prescriptions/:id', guard('prescriptions.admin.list', ...MEDICAL), rxCrud.getOne);
router.put('/prescriptions/:id', guard('prescriptions.admin.update', ...MEDICAL), rxCrud.update);
router.delete('/prescriptions/:id', guard('prescriptions.admin.delete', ...SUPER), rxCrud.remove);

// ═══════════════════════════════════════════
//  NOTIFICATIONS – manual admin campaigns only
// ═══════════════════════════════════════════
const NotificationsAdminController = require('../notifications/notifications.admin.controller');

router.get('/notifications/users/search', guard('notifications.admin.send', ...SUPER), NotificationsAdminController.searchUsers);
router.get('/notifications/manual', guard('notifications.admin.manage', ...SUPER), NotificationsAdminController.listManual);
router.get('/notifications/manual/:id', guard('notifications.admin.manage', ...SUPER), NotificationsAdminController.getManual);
router.post('/notifications/send', guard('notifications.admin.send', ...SUPER), NotificationsAdminController.sendManual);
router.post('/notifications/manual/:id/resend', guard('notifications.admin.send', ...SUPER), NotificationsAdminController.resendManual);
router.delete('/notifications/manual/:id', guard('notifications.admin.manage', ...SUPER), NotificationsAdminController.deleteManual);

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
  if (!data) throw new NotFoundError('SETTING_NOT_FOUND');
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
  return successResponse(res, { data: null, messageKey: 'SETTING_DELETED' });
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
  if (!data) throw new NotFoundError('AUDIT_LOG_NOT_FOUND');
  return successResponse(res, { data });
}));

// ═══════════════════════════════════════════
//  CHRONIC DISEASES – full CRUD
// ═══════════════════════════════════════════
const chronicDiseaseCrud = crud('chronicDisease', { entityLabel: 'ChronicDisease' });
router.get('/chronic-diseases', guard('medical-master.list', ...MEDICAL), chronicDiseaseCrud.list);
router.get('/chronic-diseases/:id', guard('medical-master.list', ...MEDICAL), chronicDiseaseCrud.getOne);
router.post('/chronic-diseases', guard('medical-master.create', ...MEDICAL), chronicDiseaseCrud.create);
router.put('/chronic-diseases/:id', guard('medical-master.update', ...MEDICAL), chronicDiseaseCrud.update);
router.delete('/chronic-diseases/:id', guard('medical-master.delete', ...SUPER), chronicDiseaseCrud.remove);

// ═══════════════════════════════════════════
//  ALLERGIES – full CRUD
// ═══════════════════════════════════════════
const allergyCrud = crud('allergy', { entityLabel: 'Allergy' });
router.get('/allergies', guard('medical-master.list', ...MEDICAL), allergyCrud.list);
router.get('/allergies/:id', guard('medical-master.list', ...MEDICAL), allergyCrud.getOne);
router.post('/allergies', guard('medical-master.create', ...MEDICAL), allergyCrud.create);
router.put('/allergies/:id', guard('medical-master.update', ...MEDICAL), allergyCrud.update);
router.delete('/allergies/:id', guard('medical-master.delete', ...SUPER), allergyCrud.remove);

// ═══════════════════════════════════════════
//  MEDICATIONS – full CRUD
// ═══════════════════════════════════════════
const medCrud = crud('medication', { entityLabel: 'Medication' });
router.get('/medications', guard('medical-master.list', ...MEDICAL), medCrud.list);
router.get('/medications/:id', guard('medical-master.list', ...MEDICAL), medCrud.getOne);
router.post('/medications', guard('medical-master.create', ...MEDICAL), medCrud.create);
router.put('/medications/:id', guard('medical-master.update', ...MEDICAL), medCrud.update);
router.delete('/medications/:id', guard('medical-master.delete', ...SUPER), medCrud.remove);

// ═══════════════════════════════════════════
//  MEDICAL TESTS – full CRUD
// ═══════════════════════════════════════════
const testCrud = crud('medicalTest', { entityLabel: 'MedicalTest' });
router.get('/medical-tests', guard('medical-master.list', ...MEDICAL), testCrud.list);
router.get('/medical-tests/:id', guard('medical-master.list', ...MEDICAL), testCrud.getOne);
router.post('/medical-tests', guard('medical-master.create', ...MEDICAL), testCrud.create);
router.put('/medical-tests/:id', guard('medical-master.update', ...MEDICAL), testCrud.update);
router.delete('/medical-tests/:id', guard('medical-master.delete', ...SUPER), testCrud.remove);

module.exports = router;

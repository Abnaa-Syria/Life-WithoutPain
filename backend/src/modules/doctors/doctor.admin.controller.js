const DoctorService = require('./doctor.service');
const { successResponse, paginatedResponse } = require('../../shared/responses');
const { asyncHandler } = require('../../utils/helpers');
const { buildPagination } = require('../../utils/pagination');
const DoctorRepository = require('./doctor.repository');
const UserRepository = require('../auth/user.repository'); // I'll need this too

class DoctorAdminController {
  static list = asyncHandler(async (req, res) => {
    const { page, limit, skip } = buildPagination(req.query);
    const where = {};
    if (req.query.verificationStatus) where.verificationStatus = req.query.verificationStatus;
    if (req.query.search) where.user = { fullName: { contains: req.query.search } };
    
    const [data, total] = await Promise.all([
      DoctorRepository.findMany({ 
        where, 
        skip, 
        take: limit, 
        orderBy: { createdAt: 'desc' }, 
        include: {
          user: { select: { id: true, fullName: true, email: true, phone: true, status: true } },
          speciality: true,
          verificationDocuments: {
            where: { fileType: 'LICENSE' },
            select: { id: true, fileUrl: true, fileType: true, reviewStatus: true, createdAt: true },
          },
        },
      }),
      DoctorRepository.count({ where }),
    ]);
    
    return paginatedResponse(res, { data, total, page, limit });
  });

  static getOne = asyncHandler(async (req, res) => {
    const data = await DoctorRepository.findWithDetails(req.params.id);
    if (!data) return res.status(404).json({ message: 'Doctor not found' });
    return successResponse(res, { data });
  });

  static update = asyncHandler(async (req, res) => {
    const data = await DoctorRepository.update({ 
      where: { id: parseInt(req.params.id) }, 
      data: req.body, 
      include: { user: { select: { fullName: true } }, speciality: true } 
    });
    // Audit log should be here or in service. User mentioned "route file must call handlers from controllers"
    // I'll keep audit log call in controller for now or move to service if it's "business logic"
    return successResponse(res, { data });
  });

  static delete = asyncHandler(async (req, res) => {
    const doc = await DoctorRepository.findUnique({ where: { id: parseInt(req.params.id) } });
    if (doc) {
      const UserRepository = require('../auth/user.repository');
      await UserRepository.update({ 
        where: { id: doc.userId }, 
        data: { deletedAt: new Date(), status: 'INACTIVE' } 
      });
    }
    return successResponse(res, { data: null, messageKey: 'DOCTOR_DEACTIVATED' });
  });

  static approve = asyncHandler(async (req, res) => {
    const data = await DoctorRepository.update({
      where: { id: parseInt(req.params.id) },
      data: { verificationStatus: 'APPROVED', isPubliclyBookable: true },
    });

    const { eventEmitter, EVENTS } = require('../../shared/events/eventEmitter');
    eventEmitter.emit(EVENTS.VERIFICATION.DOCTOR_APPROVED, {
      doctorProfile: { id: data.id },
      userId: data.userId,
    });

    return successResponse(res, { data, messageKey: 'DOCTOR_APPROVED' });
  });

  static reject = asyncHandler(async (req, res) => {
    const data = await DoctorRepository.update({
      where: { id: parseInt(req.params.id) },
      data: { verificationStatus: 'REJECTED', isPubliclyBookable: false },
    });

    const { eventEmitter, EVENTS } = require('../../shared/events/eventEmitter');
    eventEmitter.emit(EVENTS.VERIFICATION.DOCTOR_REJECTED, {
      doctorProfile: { id: data.id },
      userId: data.userId,
      reason: req.body?.reason || req.body?.reviewNotes || null,
    });

    return successResponse(res, { data, messageKey: 'DOCTOR_REJECTED' });
  });

  static updateStatus = asyncHandler(async (req, res) => {
    const data = await DoctorRepository.update({ 
      where: { id: parseInt(req.params.id) }, 
      data: req.body 
    });
    return successResponse(res, { data });
  });
}

module.exports = DoctorAdminController;

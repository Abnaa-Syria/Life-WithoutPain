const router = require('express').Router();
const { authenticate, authorize } = require('../../middlewares/auth');
const { asyncHandler } = require('../../utils/helpers');
const { successResponse, createdResponse } = require('../../shared/responses');
const prisma = require('../../config/database');
const { ROLES } = require('../../constants');
const { NotFoundError } = require('../../shared/errors/AppError');
const videoProvider = require('../../shared/video');

router.use(authenticate);

router.post('/', authorize(ROLES.DOCTOR), asyncHandler(async (req, res) => {
  const session = await videoProvider.createSession({
    appointmentId: req.body.appointmentId,
    type: req.body.sessionType || 'VIDEO',
  });

  const data = await prisma.callSession.create({
    data: {
      appointmentId: req.body.appointmentId,
      patientId: req.body.patientId,
      doctorId: req.body.doctorId,
      sessionType: req.body.sessionType || 'VIDEO',
      provider: session.provider,
      sessionId: session.sessionId,
      joinUrlPatient: session.joinUrlPatient,
      joinUrlDoctor: session.joinUrlDoctor,
    },
  });
  return createdResponse(res, { data });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const data = await prisma.callSession.findUnique({ where: { id: parseInt(req.params.id) } });
  if (!data) throw new NotFoundError('Call session not found');
  return successResponse(res, { data });
}));

router.patch('/:id/start', asyncHandler(async (req, res) => {
  const data = await prisma.callSession.update({
    where: { id: parseInt(req.params.id) },
    data: { status: 'IN_PROGRESS', startedAt: new Date() },
  });
  return successResponse(res, { data });
}));

router.patch('/:id/end', asyncHandler(async (req, res) => {
  const session = await prisma.callSession.findUnique({ where: { id: parseInt(req.params.id) } });
  if (!session) throw new NotFoundError('Call session not found');

  const duration = session.startedAt ? Math.floor((new Date() - session.startedAt) / 1000) : 0;
  const data = await prisma.callSession.update({
    where: { id: parseInt(req.params.id) },
    data: { status: 'COMPLETED', endedAt: new Date(), durationSeconds: duration },
  });
  return successResponse(res, { data });
}));

module.exports = router;

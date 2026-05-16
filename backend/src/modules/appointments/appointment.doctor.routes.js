const router = require('express').Router();
const controller = require('./appointment.doctor.controller');
const callSessionDoctorController = require('../call-sessions/callSession.doctor.controller');
const conversationDoctorController = require('../conversations/conversation.doctor.controller');

router.get('/', controller.list);
router.get('/:id', controller.getOne);
router.patch('/:id/confirm', controller.confirm);
router.patch('/:id/reject', controller.reject);
router.patch('/:id/cancel', controller.cancel);
router.post('/:id/start-session', callSessionDoctorController.startSession);
router.get('/:id/chat', conversationDoctorController.getChat);
router.post('/:id/chat', conversationDoctorController.sendMessage);

module.exports = router;

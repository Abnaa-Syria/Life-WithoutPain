const router = require('express').Router();
const controller = require('./support.patient.controller');

router.get('/cases', controller.listCases);
router.post('/cases', controller.createCase);
router.get('/cases/:id', controller.getCase);
router.get('/cases/:id/messages', controller.getMessages);
router.post('/cases/:id/messages', controller.addMessage);

module.exports = router;

const router = require('express').Router();
const controller = require('./appointments.patient.controller');
const { validate } = require('../../middlewares/validate');
const { createAppointmentSchema, listAppointmentQuerySchema } = require('../appointments/appointment.validator');

router.get('/', validate(listAppointmentQuerySchema, 'query'), controller.list);
router.post('/', validate(createAppointmentSchema), controller.create);
router.get('/:id', controller.getById);
router.get('/:id/session', controller.getSession);
router.patch('/:id/cancel', controller.cancel);
router.patch('/:id/reschedule', controller.reschedule);

module.exports = router;

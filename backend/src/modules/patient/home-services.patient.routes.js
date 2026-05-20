const router = require('express').Router();
const controller = require('./home-services.patient.controller');
const { validate } = require('../../middlewares/validate');
const {
  createHomeServiceSchema,
  cancelHomeServiceSchema,
  homeServiceIdParamSchema,
} = require('../home-services/home-service.validator');

router.get('/', controller.list);
router.post('/', validate(createHomeServiceSchema), controller.create);
router.get('/:id', validate(homeServiceIdParamSchema, 'params'), controller.getById);
router.patch('/:id/cancel', validate(homeServiceIdParamSchema, 'params'), validate(cancelHomeServiceSchema), controller.cancel);

module.exports = router;

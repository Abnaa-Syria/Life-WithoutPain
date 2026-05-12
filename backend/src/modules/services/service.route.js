const router = require('express').Router();
const ServiceController = require('./service.controller');
const { authenticate, authorize } = require('../../middlewares/auth');
const { ROLES } = require('../../constants');

router.get('/', ServiceController.list);
router.get('/:id', ServiceController.getById);
router.post('/', authenticate, authorize(ROLES.SUPER_ADMIN, ROLES.MEDICAL_ADMIN), ServiceController.create);
router.put('/:id', authenticate, authorize(ROLES.SUPER_ADMIN, ROLES.MEDICAL_ADMIN), ServiceController.update);
router.delete('/:id', authenticate, authorize(ROLES.SUPER_ADMIN), ServiceController.delete);

module.exports = router;

const router = require('express').Router();
const CallSessionController = require('./callSession.controller');
const { authenticate, authorize } = require('../../middlewares/auth');
const { ROLES } = require('../../constants');

router.use(authenticate);

router.post('/', authorize(ROLES.DOCTOR), CallSessionController.create);
router.get('/:id', CallSessionController.getById);
router.patch('/:id/start', CallSessionController.start);
router.patch('/:id/end', CallSessionController.end);

module.exports = router;

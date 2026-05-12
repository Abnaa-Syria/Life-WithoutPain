const router = require('express').Router();
const ReviewController = require('./review.controller');
const { authenticate, authorize } = require('../../middlewares/auth');
const { ROLES } = require('../../constants');

router.post('/', authenticate, authorize(ROLES.PATIENT), ReviewController.create);
router.get('/doctor/:doctorId', ReviewController.listByDoctor);

module.exports = router;

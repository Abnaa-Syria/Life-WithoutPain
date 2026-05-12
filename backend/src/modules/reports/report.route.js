const router = require('express').Router();
const ReportController = require('./report.controller');
const { authenticate, authorize } = require('../../middlewares/auth');
const { ROLES } = require('../../constants');

router.use(authenticate);

router.post('/', authorize(ROLES.DOCTOR), ReportController.create);
router.get('/', ReportController.list);
router.get('/:id', ReportController.getById);
router.put('/:id', authorize(ROLES.DOCTOR), ReportController.update);
router.get('/:id/pdf', ReportController.getPdf);

module.exports = router;

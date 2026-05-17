const router = require('express').Router();
const controller = require('./family-members.patient.controller');

router.get('/', controller.list);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);

module.exports = router;

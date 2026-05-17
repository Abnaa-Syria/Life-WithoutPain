const router = require('express').Router();
const controller = require('./insurances.patient.controller');
const { uploadSingle } = require('../../middlewares/upload');

router.get('/', controller.list);
router.post('/', uploadSingle('cardImage'), controller.create);
router.put('/:id', uploadSingle('cardImage'), controller.update);
router.delete('/:id', controller.remove);

module.exports = router;

const router = require('express').Router();
const controller = require('./records.patient.controller');

router.get('/prescriptions', controller.listPrescriptions);
router.get('/prescriptions/:id/pdf', controller.getPrescriptionPdf);
router.get('/prescriptions/:id', controller.getPrescription);
router.get('/reports', controller.listReports);
router.get('/reports/:id/pdf', controller.getReportPdf);
router.get('/reports/:id', controller.getReport);
router.get('/x-rays', controller.listXrays);
router.get('/x-rays/:id/pdf', controller.getXrayPdf);
router.get('/x-rays/:id', controller.getXray);

module.exports = router;

/**
 * @swagger
 * /lab-tests:
 *   post:
 *     tags: [Lab Tests]
 *     summary: Request a lab test (Doctor only)
 *     security:
 *       - bearerAuth: []
 *   get:
 *     tags: [Lab Tests]
 *     summary: List lab tests
 *     security:
 *       - bearerAuth: []
 *
 * /lab-tests/{id}:
 *   get:
 *     tags: [Lab Tests]
 *     summary: Get lab test details
 *     security:
 *       - bearerAuth: []
 *
 * /lab-tests/{id}/results:
 *   post:
 *     tags: [Lab Tests]
 *     summary: Upload lab result file
 *     security:
 *       - bearerAuth: []
 *   get:
 *     tags: [Lab Tests]
 *     summary: Get lab test results
 *     security:
 *       - bearerAuth: []
 *
 * /prescriptions:
 *   post:
 *     tags: [Prescriptions]
 *     summary: Create a prescription (Doctor only)
 *     security:
 *       - bearerAuth: []
 *   get:
 *     tags: [Prescriptions]
 *     summary: List prescriptions
 *     security:
 *       - bearerAuth: []
 *
 * /prescriptions/{id}:
 *   get:
 *     tags: [Prescriptions]
 *     summary: Get prescription by ID
 *     security:
 *       - bearerAuth: []
 *
 * /prescriptions/{id}/pdf:
 *   get:
 *     tags: [Prescriptions]
 *     summary: Get prescription PDF URL
 *     security:
 *       - bearerAuth: []
 *
 * /prescriptions/{id}/qr:
 *   get:
 *     tags: [Prescriptions]
 *     summary: Get prescription QR code
 *     security:
 *       - bearerAuth: []
 *
 * /reports:
 *   post:
 *     tags: [Reports]
 *     summary: Create a medical report (Doctor only)
 *     security:
 *       - bearerAuth: []
 *   get:
 *     tags: [Reports]
 *     summary: List medical reports
 *     security:
 *       - bearerAuth: []
 *
 * /reports/{id}:
 *   get:
 *     tags: [Reports]
 *     summary: Get report by ID
 *     security:
 *       - bearerAuth: []
 *
 * /reports/{id}/pdf:
 *   get:
 *     tags: [Reports]
 *     summary: Get report PDF URL
 *     security:
 *       - bearerAuth: []
 */

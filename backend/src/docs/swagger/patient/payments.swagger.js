/**
 * @swagger
 * /patient/payments/initiate:
 *   post:
 *     tags: [Patient App - Payments]
 *     summary: Record payment (separate from booking)
 *     description: |
 *       Payment methods: VISA, MASTERCARD, APPLE_PAY.
 *       Mock provider auto-accepts as PAID — TODO integrate real payment gateway.
 *       Booking without payment is allowed; initiate payment after booking when ready.
 *       Provide exactly one of appointmentId or homeServiceRequestId.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PatientPaymentInitiateRequest'
 *           example:
 *             appointmentId: 1
 *             amount: 250
 *             method: VISA
 *     responses:
 *       201:
 *         description: Payment recorded (mock auto-accepts as PAID)
 *
 * /patient/payments:
 *   get:
 *     tags: [Patient App - Payments]
 *     summary: List patient payments
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Paginated payments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 data: { type: array, items: { type: object } }
 *                 meta:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *
 * /patient/payments/{id}:
 *   get:
 *     tags: [Patient App - Payments]
 *     summary: Get payment by id
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Payment detail
 *
 */

module.exports = {};

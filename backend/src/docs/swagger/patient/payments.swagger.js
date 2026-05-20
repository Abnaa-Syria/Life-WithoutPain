/**
 * @swagger
 * /patient/payments/initiate:
 *   post:
 *     tags: [Patient App - Payments]
 *     summary: Initiate payment (VISA, MASTERCARD, APPLE_PAY)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               appointmentId: { type: integer }
 *               amount: { type: number }
 *               method: { type: string, enum: [VISA, MASTERCARD, APPLE_PAY, INSURANCE] }
 *           example:
 *             appointmentId: 1
 *             amount: 250
 *             method: VISA
 *     responses:
 *       201:
 *         description: Payment URL returned
 *
 */

module.exports = {};

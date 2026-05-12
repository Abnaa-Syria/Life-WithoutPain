/**
 * @swagger
 * /payments/initiate:
 *   post:
 *     tags: [Payments]
 *     summary: Initiate a payment
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount: { type: number }
 *               currency: { type: string, default: SAR }
 *               description: { type: string }
 *               appointmentId: { type: integer }
 *               method: { type: string }
 *     responses:
 *       201:
 *         description: Payment initiated
 *
 * /payments/webhook:
 *   post:
 *     tags: [Payments]
 *     summary: Payment gateway webhook
 *     responses:
 *       200:
 *         description: Webhook received
 *
 * /payments:
 *   get:
 *     tags: [Payments]
 *     summary: List payments
 *     security:
 *       - bearerAuth: []
 *
 * /payments/{id}:
 *   get:
 *     tags: [Payments]
 *     summary: Get payment by ID
 *     security:
 *       - bearerAuth: []
 *
 * /claims/batches:
 *   post:
 *     tags: [Claims]
 *     summary: Create a claim batch
 *     security:
 *       - bearerAuth: []
 *   get:
 *     tags: [Claims]
 *     summary: List claim batches
 *     security:
 *       - bearerAuth: []
 *
 * /claims/batches/{id}/submit:
 *   patch:
 *     tags: [Claims]
 *     summary: Submit a claim batch
 *     security:
 *       - bearerAuth: []
 *
 * /claims/items:
 *   get:
 *     tags: [Claims]
 *     summary: List claim items
 *     security:
 *       - bearerAuth: []
 *
 * /reconciliations:
 *   get:
 *     tags: [Reconciliations]
 *     summary: List reconciliations
 *     security:
 *       - bearerAuth: []
 *   post:
 *     tags: [Reconciliations]
 *     summary: Create a reconciliation record
 *     security:
 *       - bearerAuth: []
 *
 * /doctor-payouts:
 *   get:
 *     tags: [Doctor Payouts]
 *     summary: List doctor payouts
 *     security:
 *       - bearerAuth: []
 *   post:
 *     tags: [Doctor Payouts]
 *     summary: Create a payout record
 *     security:
 *       - bearerAuth: []
 *
 * /doctor-payouts/{id}/pay:
 *   patch:
 *     tags: [Doctor Payouts]
 *     summary: Mark a payout as paid
 *     security:
 *       - bearerAuth: []
 */

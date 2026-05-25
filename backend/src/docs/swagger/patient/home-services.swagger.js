/**
 * @swagger
 * /patient/home-services:
 *   get:
 *     tags: [Patient App - Home Services]
 *     summary: List home service requests
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, ASSIGNED, SCHEDULED, COMPLETED, CANCELLED]
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *         example: 20
 *     responses:
 *       200:
 *         description: Paginated home service requests
 *   post:
 *     tags: [Patient App - Home Services]
 *     summary: Request a home service visit
 *     description: Date-only booking with visit address. Use POST /patient/appointments for clinic or remote visits. paymentMode INSURANCE creates a pre-authorization case and sets insuranceStatus to PENDING_VERIFICATION; track via GET /patient/insurance-requests.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [serviceId, visitAddress, preferredDate, paymentMode]
 *             properties:
 *               serviceId: { type: integer, description: Must be a HOME type service }
 *               visitAddress: { type: string }
 *               notes: { type: string }
 *               preferredDate: { type: string, format: date }
 *               paymentMode: { type: string, enum: [DIRECT, INSURANCE] }
 *           example:
 *             serviceId: 2
 *             visitAddress: '123 Main St, Riyadh'
 *             notes: 'Please call before arrival'
 *             preferredDate: '2026-06-01'
 *             paymentMode: DIRECT
 *     responses:
 *       201:
 *         description: Home service request created
 *
 * /patient/home-services/{id}:
 *   get:
 *     tags: [Patient App - Home Services]
 *     summary: Home service request detail
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         example: 1
 *     responses:
 *       200:
 *         description: Request detail
 *
 * /patient/home-services/{id}/cancel:
 *   patch:
 *     tags: [Patient App - Home Services]
 *     summary: Cancel home service request
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         example: 1
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason: { type: string }
 *           example:
 *             reason: 'Changed plans'
 *     responses:
 *       200:
 *         description: Request cancelled
 *
 */

module.exports = {};

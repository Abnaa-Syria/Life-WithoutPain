/**
 * @swagger
 * /patient/home-services:
 *   get:
 *     tags: [Patient App - Home Services]
 *     summary: Retrieve home service requests
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
 *   post:
 *     tags: [Patient App - Home Services]
 *     summary: Book home service
 *     description: |
 *       Figma field aliases: bookingType → paymentMode, date → preferredDate,
 *       address → visitAddress, additionalNotes → notes.
 *       List available services via GET /patient/services?type=HOME.
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
 *               visitAddress: { type: string, description: Figma alias — address }
 *               address: { type: string, description: Alias for visitAddress }
 *               notes: { type: string, description: Figma alias — additionalNotes }
 *               additionalNotes: { type: string, description: Alias for notes }
 *               preferredDate: { type: string, format: date, description: Figma alias — date }
 *               date: { type: string, format: date, description: Alias for preferredDate }
 *               paymentMode: { type: string, enum: [DIRECT, INSURANCE] }
 *               bookingType: { type: string, enum: [medicalInsurance, directPayment], description: Alias for paymentMode }
 *               bookingMethod: { type: string, enum: [medicalInsurance, directPayment], description: Alias for paymentMode }
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

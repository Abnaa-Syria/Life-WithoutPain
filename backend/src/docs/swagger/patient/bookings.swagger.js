/**
 * @swagger
 * /patient/bookings:
 *   get:
 *     tags: [Patient App - Bookings]
 *     summary: Unified patient bookings (online consultations, home services, clinic services)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [all, confirmed, cancelled, finished]
 *           default: all
 *       - in: query
 *         name: filter
 *         schema:
 *           type: string
 *           enum: [all, confirmed, cancelled, finished]
 *         description: Alias for status
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Merged booking list with bookingType, serviceType, and paymentStatus
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PatientBookingListItem'
 *                 meta:
 *                   $ref: '#/components/schemas/PaginationMeta'
 */

module.exports = {};

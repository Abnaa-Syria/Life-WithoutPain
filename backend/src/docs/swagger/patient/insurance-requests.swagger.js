/**
 * @swagger
 * /patient/insurance-requests:
 *   get:
 *     tags: [Patient App - Insurance Requests]
 *     summary: List patient's insurance approval requests
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [OPEN, UNDER_REVIEW, APPROVED, REJECTED, MORE_INFO_REQUESTED, ESCALATED, CLOSED]
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Paginated insurance requests
 *
 * /patient/insurance-requests/{id}:
 *   get:
 *     tags: [Patient App - Insurance Requests]
 *     summary: Get insurance request detail
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Insurance request with approvals and linked booking
 */

/**
 * @swagger
 * /patient/notifications:
 *   get:
 *     tags: [Patient App - Notifications]
 *     summary: Retrieve notifications
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: isRead
 *         schema: { type: boolean }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Paginated notifications (localized title/body)
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
 *                     $ref: '#/components/schemas/PatientNotificationItem'
 *                 meta:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *
 * /patient/notifications/read-all:
 *   patch:
 *     tags: [Patient App - Notifications]
 *     summary: Mark all notifications as read
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: All marked read
 *
 * /patient/notifications/{id}/read:
 *   patch:
 *     tags: [Patient App - Notifications]
 *     summary: Mark notification as read
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Marked read
 */

module.exports = {};

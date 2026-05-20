/**
 * @swagger
 * /doctor/notifications:
 *   get:
 *     tags: [Doctor App - Notifications]
 *     summary: Get notifications
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Notifications list
 *
 * /doctor/notifications/{id}/read:
 *   patch:
 *     tags: [Doctor App - Notifications]
 *     summary: Mark notification as read
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Marked as read
 *
 */

module.exports = {};

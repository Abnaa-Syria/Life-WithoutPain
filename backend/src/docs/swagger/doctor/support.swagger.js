/**
 * @swagger
 * /doctor/support/info:
 *   get:
 *     tags: [Doctor App - Support]
 *     summary: Get support contact information
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: lang
 *         schema: { type: string, enum: [ar, en] }
 *     responses:
 *       200:
 *         description: Support contact info
 *
 * /doctor/support/tickets:
 *   get:
 *     tags: [Doctor App - Support]
 *     summary: List my support tickets
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [OPEN, IN_PROGRESS, RESOLVED, CLOSED] }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Paginated tickets
 *   post:
 *     tags: [Doctor App - Support]
 *     summary: Create support ticket
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [subject, description, category]
 *             properties:
 *               subject: { type: string }
 *               description: { type: string }
 *               category: { type: string, enum: [TECHNICAL, APPOINTMENT, PAYMENT, INSURANCE, ACCOUNT, OTHER] }
 *               priority: { type: string, enum: [LOW, MEDIUM, HIGH, URGENT] }
 *               files: { type: array, items: { type: string, format: binary } }
 *     responses:
 *       201:
 *         description: Ticket created
 *
 * /doctor/support/tickets/{id}:
 *   get:
 *     tags: [Doctor App - Support]
 *     summary: Get support ticket detail with messages
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Ticket detail
 *
 * /doctor/support/tickets/{id}/messages:
 *   post:
 *     tags: [Doctor App - Support]
 *     summary: Reply on support ticket
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [message]
 *             properties:
 *               message: { type: string }
 *               files: { type: array, items: { type: string, format: binary } }
 *     responses:
 *       201:
 *         description: Message sent
 */

module.exports = {};

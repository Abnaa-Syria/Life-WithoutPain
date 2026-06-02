/**
 * @swagger
 * /patient/conversations:
 *   get:
 *     tags: [Patient App - Conversations]
 *     summary: Retrieve doctor conversations
 *     security: [{ bearerAuth: [] }]
 *     parameters:
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
 *         description: Paginated conversations
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
 *     tags: [Patient App - Conversations]
 *     summary: Start conversation with doctor
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [doctorId]
 *             properties:
 *               doctorId: { type: integer }
 *               appointmentId: { type: integer }
 *           example:
 *             doctorId: 1
 *             appointmentId: 1
 *     responses:
 *       201:
 *         description: Conversation created
 *
 * /patient/conversations/{id}:
 *   get:
 *     tags: [Patient App - Conversations]
 *     summary: Get conversation detail
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Conversation
 *
 * /patient/conversations/{id}/messages:
 *   get:
 *     tags: [Patient App - Conversations]
 *     summary: Retrieve messages in conversation
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Paginated messages
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
 *     tags: [Patient App - Conversations]
 *     summary: Send message to doctor
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content]
 *             properties:
 *               content: { type: string }
 *               messageType: { type: string }
 *               attachmentUrl: { type: string }
 *     responses:
 *       201:
 *         description: Message sent
 *
 * /patient/conversations/{id}/messages/{messageId}/read:
 *   patch:
 *     tags: [Patient App - Conversations]
 *     summary: Mark message as read
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Message marked read
 *
 */

module.exports = {};

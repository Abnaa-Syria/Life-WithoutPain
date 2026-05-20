/**
 * @swagger
 * /patient/support/cases:
 *   get:
 *     tags: [Patient App - Support]
 *     summary: List support tickets
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
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *         example: OPEN
 *     responses:
 *       200:
 *         description: Support cases
 *   post:
 *     tags: [Patient App - Support]
 *     summary: Contact support team
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [subject, description]
 *             properties:
 *               subject: { type: string }
 *               description: { type: string }
 *               type: { type: string }
 *               priority: { type: string }
 *           example:
 *             subject: 'Payment issue'
 *             description: 'I was charged twice for my appointment.'
 *             type: GENERAL
 *             priority: MEDIUM
 *     responses:
 *       201:
 *         description: Support case created
 *
 * /patient/support/cases/{id}/messages:
 *   get:
 *     tags: [Patient App - Support]
 *     summary: Support case messages
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         example: 1
 *     responses:
 *       200:
 *         description: Messages thread
 *   post:
 *     tags: [Patient App - Support]
 *     summary: Send support message
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content]
 *             properties:
 *               content: { type: string }
 *           example:
 *             content: 'Here is more detail about the payment problem.'
 *     responses:
 *       201:
 *         description: Message sent
 */

 */

module.exports = {};

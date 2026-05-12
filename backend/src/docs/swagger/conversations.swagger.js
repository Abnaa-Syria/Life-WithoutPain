/**
 * @swagger
 * /conversations:
 *   get:
 *     tags: [Conversations]
 *     summary: List conversations for current user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Conversation list
 *   post:
 *     tags: [Conversations]
 *     summary: Create a new conversation
 *     security:
 *       - bearerAuth: []
 *
 * /conversations/{id}:
 *   get:
 *     tags: [Conversations]
 *     summary: Get conversation details
 *     security:
 *       - bearerAuth: []
 *
 * /conversations/{id}/messages:
 *   get:
 *     tags: [Conversations]
 *     summary: Get messages in a conversation
 *     security:
 *       - bearerAuth: []
 *   post:
 *     tags: [Conversations]
 *     summary: Send a message
 *     security:
 *       - bearerAuth: []
 *
 * /conversations/{id}/messages/{messageId}/read:
 *   patch:
 *     tags: [Conversations]
 *     summary: Mark a message as read
 *     security:
 *       - bearerAuth: []
 */

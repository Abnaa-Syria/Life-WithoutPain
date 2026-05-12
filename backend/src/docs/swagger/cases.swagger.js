/**
 * @swagger
 * /insurance-cases:
 *   post:
 *     tags: [Insurance Cases]
 *     summary: Submit a new insurance case
 *     security:
 *       - bearerAuth: []
 *   get:
 *     tags: [Insurance Cases]
 *     summary: List insurance cases (Staff only)
 *     security:
 *       - bearerAuth: []
 *
 * /insurance-cases/{id}:
 *   get:
 *     tags: [Insurance Cases]
 *     summary: Get insurance case by ID
 *     security:
 *       - bearerAuth: []
 *
 * /insurance-cases/{id}/approve:
 *   patch:
 *     tags: [Insurance Cases]
 *     summary: Approve an insurance case
 *     security:
 *       - bearerAuth: []
 *
 * /insurance-cases/{id}/reject:
 *   patch:
 *     tags: [Insurance Cases]
 *     summary: Reject an insurance case
 *     security:
 *       - bearerAuth: []
 *
 * /insurance-cases/{id}/escalate:
 *   patch:
 *     tags: [Insurance Cases]
 *     summary: Escalate an insurance case
 *     security:
 *       - bearerAuth: []
 *
 * /support-cases:
 *   post:
 *     tags: [Support Cases]
 *     summary: Submit a new support case
 *     security:
 *       - bearerAuth: []
 *   get:
 *     tags: [Support Cases]
 *     summary: List support cases (Staff only)
 *     security:
 *       - bearerAuth: []
 *
 * /support-cases/{id}:
 *   get:
 *     tags: [Support Cases]
 *     summary: Get support case by ID
 *     security:
 *       - bearerAuth: []
 *
 * /support-cases/{id}/messages:
 *   get:
 *     tags: [Support Cases]
 *     summary: Get support case messages
 *     security:
 *       - bearerAuth: []
 *   post:
 *     tags: [Support Cases]
 *     summary: Send a message in a support case
 *     security:
 *       - bearerAuth: []
 */

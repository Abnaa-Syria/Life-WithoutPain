/**
 * @swagger
 * /services:
 *   get:
 *     tags: [Services]
 *     summary: List all medical services
 *     responses:
 *       200:
 *         description: Service list
 *   post:
 *     tags: [Services]
 *     summary: Create a service (Admin only)
 *     security:
 *       - bearerAuth: []
 *
 * /services/{id}:
 *   get:
 *     tags: [Services]
 *     summary: Get service by ID
 *   put:
 *     tags: [Services]
 *     summary: Update a service (Admin only)
 *     security:
 *       - bearerAuth: []
 *   delete:
 *     tags: [Services]
 *     summary: Delete a service (Super Admin only)
 *     security:
 *       - bearerAuth: []
 *
 * /insurance-providers:
 *   get:
 *     tags: [Insurance Providers]
 *     summary: List insurance providers
 *   post:
 *     tags: [Insurance Providers]
 *     summary: Create insurance provider (Super Admin only)
 *     security:
 *       - bearerAuth: []
 *
 * /insurance-providers/{id}:
 *   get:
 *     tags: [Insurance Providers]
 *     summary: Get insurance provider by ID
 *   put:
 *     tags: [Insurance Providers]
 *     summary: Update insurance provider
 *     security:
 *       - bearerAuth: []
 *   delete:
 *     tags: [Insurance Providers]
 *     summary: Delete insurance provider
 *     security:
 *       - bearerAuth: []
 */

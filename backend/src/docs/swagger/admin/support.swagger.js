/**
 * @swagger
 * /admin/support/info:
 *   get:
 *     tags: [Admin - Support]
 *     summary: Get support contact settings
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Support info record
 *   patch:
 *     tags: [Admin - Support]
 *     summary: Update support contact settings
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               supportPhones: { type: array, items: { type: string } }
 *               supportEmail: { type: string }
 *               whatsappNumber: { type: string }
 *               whatsappLink: { type: string }
 *               socialLinks: { type: object }
 *               workingHours: { type: object }
 *               descriptionAr: { type: string }
 *               descriptionEn: { type: string }
 *     responses:
 *       200:
 *         description: Updated
 *
 * /admin/support/tickets:
 *   get:
 *     tags: [Admin - Support]
 *     summary: List all support tickets
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *       - in: query
 *         name: creatorRole
 *         schema: { type: string, enum: [PATIENT, DOCTOR] }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string }
 *       - in: query
 *         name: sortOrder
 *         schema: { type: string, enum: [asc, desc] }
 *     responses:
 *       200:
 *         description: Paginated tickets
 *
 * /admin/support/tickets/{id}:
 *   get:
 *     tags: [Admin - Support]
 *     summary: Get ticket detail with conversation
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
 * /admin/support/tickets/{id}/status:
 *   patch:
 *     tags: [Admin - Support]
 *     summary: Update ticket status
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [OPEN, IN_PROGRESS, RESOLVED, CLOSED] }
 *               resolutionNotes: { type: string }
 *     responses:
 *       200:
 *         description: Status updated
 *
 * /admin/support/tickets/{id}/assign:
 *   patch:
 *     tags: [Admin - Support]
 *     summary: Assign ticket to admin
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [assignedAdminId]
 *             properties:
 *               assignedAdminId: { type: integer }
 *     responses:
 *       200:
 *         description: Assigned
 *
 * /admin/support/tickets/{id}/messages:
 *   post:
 *     tags: [Admin - Support]
 *     summary: Admin reply on ticket
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
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

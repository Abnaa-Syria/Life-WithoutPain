/**
 * @swagger
 * /doctors/search:
 *   get:
 *     tags: [Doctors]
 *     summary: Search for doctors
 *     parameters:
 *       - in: query
 *         name: specialityId
 *         schema: { type: integer }
 *       - in: query
 *         name: city
 *         schema: { type: string }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Doctor list successfully fetched
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 * 
 * /doctors/{id}:
 *   get:
 *     tags: [Doctors]
 *     summary: Get doctor details by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Doctor details fetched
 * 
 * /doctors/me/profile:
 *   get:
 *     tags: [Doctors]
 *     summary: Get current doctor profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile details
 */

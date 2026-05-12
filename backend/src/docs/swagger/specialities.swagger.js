/**
 * @swagger
 * /specialities:
 *   get:
 *     tags: [Specialities]
 *     summary: Get all specialities
 *     responses:
 *       200:
 *         description: List of specialities
 *   post:
 *     tags: [Specialities]
 *     summary: Create a new speciality
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Speciality created
 * 
 * /specialities/{id}:
 *   get:
 *     tags: [Specialities]
 *     summary: Get speciality by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Speciality details
 */

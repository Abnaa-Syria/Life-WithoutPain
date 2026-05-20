/**
 * @swagger
 * /doctor/availabilities:
 *   get:
 *     tags: [Doctor App - Availabilities]
 *     summary: Get doctor availability
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Availability slots
 *   post:
 *     tags: [Doctor App - Availabilities]
 *     summary: Create availability
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               morningStart: { type: string, example: "09:00" }
 *               morningEnd: { type: string, example: "12:00" }
 *               nightStart: { type: string, example: "17:00" }
 *               nightEnd: { type: string, example: "21:00" }
 *               examinationDuration: { type: integer, example: 30 }
 *               breakDuration: { type: integer, example: 10 }
 *               days:
 *                 type: array
 *                 items: { type: string, example: monday }
 *     responses:
 *       201:
 *         description: Availability created
 *
 */

module.exports = {};

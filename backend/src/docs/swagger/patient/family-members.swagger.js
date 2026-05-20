/**
 * @swagger
 * /patient/family-members:
 *   get:
 *     tags: [Patient App - Family Members]
 *     summary: List family members
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Family members with residence card number and derived age
 *   post:
 *     tags: [Patient App - Family Members]
 *     summary: Add family member
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fullName, relationType]
 *             properties:
 *               fullName: { type: string }
 *               residenceCardNumber: { type: string }
 *               relationType: { type: string }
 *               gender: { type: string, enum: [MALE, FEMALE] }
 *               dateOfBirth: { type: string, format: date }
 *               phone: { type: string }
 *               notes: { type: string }
 *           example:
 *             fullName: 'سارة أحمد'
 *             residenceCardNumber: '9876543210'
 *             relationType: 'daughter'
 *             gender: FEMALE
 *             dateOfBirth: '2015-03-10'
 *             phone: '+966500000002'
 *     responses:
 *       201:
 *         description: Family member created
 *
 * /patient/family-members/{id}:
 *   put:
 *     tags: [Patient App - Family Members]
 *     summary: Update family member
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
 *             properties:
 *               fullName: { type: string }
 *               relationType: { type: string }
 *               phone: { type: string }
 *           example:
 *             fullName: 'سارة أحمد'
 *             relationType: 'daughter'
 *             phone: '+966500000002'
 *     responses:
 *       200:
 *         description: Updated
 *   delete:
 *     tags: [Patient App - Family Members]
 *     summary: Delete family member
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         example: 1
 *     responses:
 *       200:
 *         description: Deleted
 *
 */

module.exports = {};

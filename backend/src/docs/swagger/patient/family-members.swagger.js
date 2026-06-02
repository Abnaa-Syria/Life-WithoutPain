/**
 * @swagger
 * /patient/family-members:
 *   get:
 *     tags: [Patient App - Family Members]
 *     summary: Retrieve family members
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Family members with residenceCardNumber, relationship, and derived age
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PatientFamilyMemberDto'
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
 *             description: |
 *               Figma aliases: name → fullName, relationship → relationType.
 *               Age is derived from dateOfBirth when provided.
 *             properties:
 *               fullName: { type: string, description: Figma alias — name }
 *               name: { type: string, description: Alias for fullName }
 *               residenceCardNumber: { type: string }
 *               relationType: { type: string, description: Figma alias — relationship }
 *               relationship: { type: string, description: Alias for relationType }
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
 *     responses:
 *       201:
 *         description: Family member created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 data:
 *                   $ref: '#/components/schemas/PatientFamilyMemberDto'
 *
 * /patient/family-members/{id}:
 *   put:
 *     tags: [Patient App - Family Members]
 *     summary: Update family member details
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
 *               name: { type: string, description: Alias for fullName }
 *               residenceCardNumber: { type: string }
 *               relationType: { type: string }
 *               relationship: { type: string, description: Alias for relationType }
 *               gender: { type: string, enum: [MALE, FEMALE] }
 *               dateOfBirth: { type: string, format: date }
 *               phone: { type: string }
 *               notes: { type: string }
 *     responses:
 *       200:
 *         description: Updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 data:
 *                   $ref: '#/components/schemas/PatientFamilyMemberDto'
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

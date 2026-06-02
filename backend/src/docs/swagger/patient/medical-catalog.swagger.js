/**
 * @swagger
 * /patient/medical-catalog/chronic-diseases:
 *   get:
 *     tags: [Patient App - Medical Catalog]
 *     summary: List active chronic diseases (admin-managed catalog)
 *     description: Use returned ids when completing medical profile (chronicDiseaseIds).
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Paginated catalog items
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
 *                     $ref: '#/components/schemas/MedicalCatalogItem'
 *                 meta:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *
 * /patient/medical-catalog/medications:
 *   get:
 *     tags: [Patient App - Medical Catalog]
 *     summary: List active medications (admin-managed catalog)
 *     description: Use returned ids when completing medical profile (medicationIds / mainMedications).
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Paginated catalog items
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
 *                     $ref: '#/components/schemas/MedicalCatalogItem'
 *                 meta:
 *                   $ref: '#/components/schemas/PaginationMeta'
 */

module.exports = {};

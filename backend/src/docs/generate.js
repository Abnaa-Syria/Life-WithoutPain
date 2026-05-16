const fs = require('fs');
const path = require('path');
const swaggerSpec = require('./swagger');

const outPath = path.join(__dirname, 'openapi.json');
fs.writeFileSync(outPath, JSON.stringify(swaggerSpec, null, 2));

const pathCount = Object.keys(swaggerSpec.paths || {}).length;
const opCount = Object.values(swaggerSpec.paths || {}).reduce((n, m) => n + Object.keys(m).length, 0);

console.log(`OpenAPI spec written to ${outPath}`);
console.log(`Paths: ${pathCount}, Operations: ${opCount}, Tags: ${(swaggerSpec.tags || []).length}`);

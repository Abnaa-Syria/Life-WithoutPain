import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.join(__dirname, '../src');

function flatten(obj, prefix = '') {
  const keys = [];
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) keys.push(...flatten(v, key));
    else keys.push(key);
  }
  return keys;
}

function walk(dir, ext = /\.(jsx|js)$/) {
  const files = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory() && ent.name !== 'node_modules') files.push(...walk(p, ext));
    else if (ext.test(ent.name)) files.push(p);
  }
  return files;
}

const en = JSON.parse(fs.readFileSync(path.join(srcDir, 'i18n/locales/en/translation.json'), 'utf8'));
const ar = JSON.parse(fs.readFileSync(path.join(srcDir, 'i18n/locales/ar/translation.json'), 'utf8'));
const enKeys = new Set(flatten(en));
const arKeys = new Set(flatten(ar));

const missingInAr = [...enKeys].filter((k) => !arKeys.has(k)).sort();
const extraInAr = [...arKeys].filter((k) => !enKeys.has(k)).sort();

const staticKeyRe = /\bt\(\s*['"]([a-z][a-zA-Z0-9_.]*)['"]/g;
const templatePrefixRe = /t\(\s*`(status|common|appointments|dashboard|common\.roles)\./g;

const usedStatic = new Set();
const dynamicPrefixes = new Set();

for (const file of walk(srcDir)) {
  const content = fs.readFileSync(file, 'utf8');
  let m;
  while ((m = staticKeyRe.exec(content)) !== null) usedStatic.add(m[1]);
  while ((m = templatePrefixRe.exec(content)) !== null) dynamicPrefixes.add(m[1]);
}

const missingInEn = [...usedStatic].filter((k) => !enKeys.has(k)).sort();
const missingInArUsed = [...usedStatic].filter((k) => !arKeys.has(k)).sort();

console.log('=== Locale parity ===');
console.log('EN keys:', enKeys.size, '| AR keys:', arKeys.size);
console.log('Missing in AR:', missingInAr.length ? missingInAr.join('\n  ') : '(none)');
console.log('Extra in AR only:', extraInAr.length ? extraInAr.join('\n  ') : '(none)');

console.log('\n=== Keys used in code but missing from EN ===');
console.log(missingInEn.length ? missingInEn.join('\n  ') : '(none)');

console.log('\n=== Keys used in code but missing from AR ===');
console.log(missingInArUsed.length ? missingInArUsed.join('\n  ') : '(none)');

if (missingInAr.length === 0 && missingInEn.length === 0 && missingInArUsed.length === 0) {
  console.log('\nAll checks passed.');
}

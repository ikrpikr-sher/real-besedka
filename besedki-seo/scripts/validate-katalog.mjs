#!/usr/bin/env node
/**
 * Проверка data/katalog.json перед деплоем или merge.
 * exit 1 — есть ошибки; exit 0 — ok (предупреждения допустимы).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizeCatalogImages } from '../lib/catalogImagesCore.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const positional = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const KATALOG = positional[0] ? path.resolve(positional[0]) : path.join(ROOT, 'data/katalog.json');
const CONFIG = path.join(ROOT, 'data/catalog-models.json');
const PUBLIC = path.join(ROOT, 'public');
const STRICT = process.argv.includes('--strict');
const SKIP_FILES = process.argv.includes('--skip-file-check');

function loadJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

const VALID_CATEGORIES = new Set([
  'otkrytye-besedki',
  'besedki-s-ostekleniem',
  'besedki-osteklennye-loft',
  'besedki-s-mangalom',
  'navesy',
  'mangaly',
  'pavilony',
  'kacheli',
]);

const UNPUBLISHED_CATEGORIES = new Set(['pergoly', 'hozbloki', 'drovniki', 'bytovki', 'mebel', 'ochagi']);

const BAD_IMAGE = /interior|07_interior|08_panels|0[9]_uzel|10_uzel|11_uzel|spec-interior/i;

let errors = 0;
let warns = 0;

function fail(msg) {
  console.error(`ERROR: ${msg}`);
  errors++;
}
function warn(msg) {
  console.warn(`WARN:  ${msg}`);
  warns++;
}

if (!fs.existsSync(KATALOG)) {
  console.log('validate-katalog: no local katalog.json (ok for deploy — prod catalog is separate)');
  process.exit(0);
}

const items = loadJson(KATALOG);
if (!Array.isArray(items)) {
  fail('katalog.json must be an array');
  process.exit(1);
}

const slugs = new Set();
for (const item of items) {
  if (!item.slug) {
    fail('item without slug');
    continue;
  }
  if (slugs.has(item.slug)) fail(`duplicate slug: ${item.slug}`);
  slugs.add(item.slug);

  if (!item.title?.trim()) fail(`${item.slug}: empty title`);
  const unpublished = UNPUBLISHED_CATEGORIES.has(item.category);
  if (unpublished) warn(`${item.slug}: unpublished category ${item.category} (не витрина)`);
  else if (!VALID_CATEGORIES.has(item.category)) fail(`${item.slug}: bad category ${item.category}`);
  if (typeof item.priceFrom !== 'number') fail(`${item.slug}: priceFrom not a number`);
  else if (item.priceFrom <= 0) warn(`${item.slug}: priceFrom is 0`);

  if (!Array.isArray(item.images)) fail(`${item.slug}: images must be array`);
  else {
    const normalized = normalizeCatalogImages(item.images, {
      publicDir: PUBLIC,
      preserveOrder: true,
      skipFileCheck: SKIP_FILES,
    });
    if (normalized.length === 0) {
      if (item.images.length === 0 || unpublished) warn(`${item.slug}: no images`);
      else fail(`${item.slug}: no valid images after normalize (all missing or excluded)`);
    }
    for (const img of item.images) {
      if (BAD_IMAGE.test(img)) warn(`${item.slug}: suspicious image ${img}`);
      if (img.startsWith('/')) {
        const rel = img.replace(/^\//, '').split('?')[0];
        if (!fs.existsSync(path.join(PUBLIC, rel))) warn(`${item.slug}: missing file ${rel}`);
      }
    }
    const hero = normalized[0];
    if (hero && STRICT) {
      const rel = hero.replace(/^\//, '');
      if (!fs.existsSync(path.join(PUBLIC, rel))) {
        fail(`${item.slug}: hero image missing: ${rel}`);
      }
    }
    if (STRICT && normalized.length > 0 && BAD_IMAGE.test(normalized[0])) {
      fail(`${item.slug}: hero is excluded type: ${normalized[0]}`);
    }
  }
}

if (fs.existsSync(CONFIG)) {
  const cfg = loadJson(CONFIG);
  const configured = new Set(Object.keys(cfg.models ?? {}));
  for (const item of items) {
    if (item.category === 'kacheli') continue;
    if (!configured.has(item.slug) && !item.model3d) {
      warn(`${item.slug}: no entry in catalog-models.json and no model3d override`);
    }
  }
}

console.log(`validate-katalog: ${items.length} items, ${errors} error(s), ${warns} warning(s)`);
process.exit(errors > 0 ? 1 : 0);

#!/usr/bin/env node
/**
 * Безопасное слияние katalog.json: upsert по slug, удалённые на сервере товары НЕ трогаем.
 *
 * Usage:
 *   node scripts/merge-katalog.mjs --base remote.json --patch local.json --out merged.json
 *   node scripts/merge-katalog.mjs --base remote.json --patch local.json --slugs b-18,b-19
 *
 * По умолчанию priceFrom берётся с base (сервера), не с patch.
 *   --take-local-prices  — взять цены из patch для указанных slug
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mergeCatalogImageLists, normalizeCatalogImages } from '../lib/catalogImagesCore.mjs';

const args = process.argv.slice(2);

function arg(name) {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
}

const basePath = arg('--base');
const patchPath = arg('--patch');
const outPath = arg('--out') ?? patchPath;
const slugFilter = arg('--slugs')?.split(',').map((s) => s.trim()).filter(Boolean);
const takeLocalPrices = args.includes('--take-local-prices');
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = path.join(ROOT, 'public');

if (!basePath || !patchPath) {
  console.error(`Usage: merge-katalog.mjs --base <server.json> --patch <local.json> [--out merged.json] [--slugs a,b] [--take-local-prices]`);
  process.exit(1);
}

function load(file) {
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!Array.isArray(data)) throw new Error(`${file} must be array`);
  return data;
}

const base = load(basePath);
const patch = load(patchPath);
const bySlug = new Map(base.map((item) => [item.slug, { ...item }]));

const touched = [];
const added = [];
const updated = [];

for (const raw of patch) {
  if (!raw.slug) continue;
  if (slugFilter && !slugFilter.includes(raw.slug)) continue;

  const prev = bySlug.get(raw.slug);
  const next = { ...raw };

  if (prev && !takeLocalPrices) {
    next.priceFrom = prev.priceFrom;
  }

  // Фото: порядок с сервера сохраняется; из patch только новые URL в конец. Без сортировки.
  if (prev?.images || raw.images) {
    if (slugFilter?.includes(raw.slug) && raw.images?.length) {
      // Явный --slugs: разрешено обновить список фото из patch (порядок patch).
      next.images = normalizeCatalogImages(raw.images, {
        publicDir: PUBLIC,
        keepExcluded: true,
        skipFileCheck: true,
        preserveOrder: true,
      });
    } else if (prev?.images?.length) {
      next.images = mergeCatalogImageLists(prev.images, raw.images, {
        publicDir: PUBLIC,
        keepExcluded: true,
        skipFileCheck: true,
      });
    } else {
      next.images = normalizeCatalogImages(raw.images ?? [], {
        publicDir: PUBLIC,
        keepExcluded: true,
        skipFileCheck: true,
        preserveOrder: true,
      });
    }
    if (next.images.length === 0 && prev?.images?.length) {
      next.images = [...prev.images];
    }
  }

  // model3d: не затирать рабочую модель пустым patch.
  if (prev?.model3d && !raw.model3d?.trim()) {
    next.model3d = prev.model3d;
  }

  if (!prev) {
    added.push(raw.slug);
  } else {
    updated.push(raw.slug);
  }

  bySlug.set(raw.slug, next);
  touched.push(raw.slug);
}

const merged = base.map((item) => bySlug.get(item.slug) ?? item);
for (const slug of added) {
  if (!base.some((i) => i.slug === slug)) {
    merged.push(bySlug.get(slug));
  }
}

// Preserve server order; append genuinely new slugs at end
const seen = new Set();
const ordered = [];
for (const item of merged) {
  if (seen.has(item.slug)) continue;
  seen.add(item.slug);
  ordered.push(item);
}

fs.writeFileSync(outPath, JSON.stringify(ordered, null, 2) + '\n');

console.log('merge-katalog report:');
console.log(`  base items:   ${base.length}`);
console.log(`  patch items:  ${patch.length}`);
console.log(`  merged items: ${ordered.length}`);
console.log(`  added:        ${added.join(', ') || '—'}`);
console.log(`  updated:      ${updated.join(', ') || '—'}`);
console.log(`  prices:       ${takeLocalPrices ? 'from patch' : 'kept from base (server)'}`);
console.log(`  output:       ${outPath}`);

if (ordered.length < base.length) {
  console.error('ERROR: merge would shrink catalog — abort');
  process.exit(1);
}

#!/usr/bin/env node
/**
 * Безопасная чистка images в katalog.json — порядок из админки НЕ меняется.
 *
 * Usage:
 *   node scripts/fix-katalog-media.mjs [--write] [--file path]
 *   node scripts/fix-katalog-media.mjs --write --fill-missing   # только пустые карточки
 *   node scripts/fix-katalog-media.mjs --write --sort-hero      # ОПАСНО: сортировка hero (нужен KATALOG_ALLOW_REORDER=1)
 *
 * По умолчанию: dedupe, убрать interior/битые пути, порядок сохранить.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  appendDiscoveredYardImages,
  normalizeCatalogImages,
} from '../lib/catalogImagesCore.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const WRITE = process.argv.includes('--write');
const FILL_MISSING = process.argv.includes('--fill-missing');
const SORT_HERO = process.argv.includes('--sort-hero');
const fileArg = process.argv.find((a, i) => process.argv[i - 1] === '--file');
const KATALOG = fileArg ? path.resolve(fileArg) : path.join(ROOT, 'data/katalog.json');
const PUBLIC = path.join(ROOT, 'public');

if (SORT_HERO && process.env.KATALOG_ALLOW_REORDER !== '1') {
  console.error('ERROR: --sort-hero blocked. Set KATALOG_ALLOW_REORDER=1 to confirm.');
  process.exit(1);
}

if (!fs.existsSync(KATALOG)) {
  console.error('No katalog.json at', KATALOG);
  process.exit(1);
}

const items = JSON.parse(fs.readFileSync(KATALOG, 'utf8'));
if (!Array.isArray(items)) {
  console.error('katalog.json must be array');
  process.exit(1);
}

let changed = 0;
const report = [];

for (const item of items) {
  const before = item.images ?? [];
  let working = [...before];

  const publicOnly = normalizeCatalogImages(working, { publicDir: PUBLIC, preserveOrder: true });

  if (FILL_MISSING && publicOnly.length === 0) {
    working = appendDiscoveredYardImages([], PUBLIC, item.category, item.slug);
  } else if (FILL_MISSING) {
    working = appendDiscoveredYardImages(working, PUBLIC, item.category, item.slug);
  } else {
    working = publicOnly;
  }

  const after = normalizeCatalogImages(working, {
    publicDir: PUBLIC,
    preserveOrder: !SORT_HERO,
  });

  if (JSON.stringify(before) !== JSON.stringify(after)) {
    changed++;
    const beforeFirst = before[0]?.split('?')[0];
    const afterFirst = after[0]?.split('?')[0];
    if (beforeFirst !== afterFirst) {
      report.push(`${item.slug}: ${path.basename(beforeFirst || '—')} → ${path.basename(afterFirst || '—')}`);
    }
    item.images = after;
  }
}

console.log(`fix-katalog-media: ${items.length} items, ${changed} updated (preserveOrder=${!SORT_HERO})`);
report.slice(0, 40).forEach((line) => console.log(' ', line));
if (report.length > 40) console.log(`  … and ${report.length - 40} more`);

if (report.length > 5 && !SORT_HERO) {
  console.warn('WARN: cover images changed for multiple items — review before --write on prod');
}

if (WRITE) {
  const backup = `${KATALOG}.before-fix.${new Date().toISOString().replace(/[:.]/g, '')}.json`;
  fs.copyFileSync(KATALOG, backup);
  fs.writeFileSync(KATALOG, JSON.stringify(items, null, 2) + '\n');
  console.log(`Written ${KATALOG}`);
  console.log(`Backup: ${backup}`);
} else {
  console.log('Dry run. Pass --write to save.');
}

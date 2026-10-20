#!/usr/bin/env node
/**
 * Восстановить images / model3d / порядок карточек из бэкапа katalog.json.
 *
 * Usage:
 *   node scripts/restore-katalog-from-backup.mjs --backup data/backups/katalog.json.TIMESTAMP.json [--write]
 *   node scripts/restore-katalog-from-backup.mjs --backup ... --slugs b-41,b-21 [--fields images,model3d]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);

function arg(name) {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
}

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const backupPath = arg('--backup');
const targetPath = arg('--target') ?? path.join(ROOT, 'data/katalog.json');
const slugFilter = arg('--slugs')?.split(',').map((s) => s.trim()).filter(Boolean);
const fields = (arg('--fields') ?? 'images,model3d').split(',').map((s) => s.trim());
const WRITE = args.includes('--write');

if (!backupPath || !fs.existsSync(backupPath)) {
  console.error('Usage: restore-katalog-from-backup.mjs --backup <path> [--target katalog.json] [--slugs a,b] [--write]');
  process.exit(1);
}

const backup = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
const current = JSON.parse(fs.readFileSync(targetPath, 'utf8'));
if (!Array.isArray(backup) || !Array.isArray(current)) {
  console.error('Both files must be arrays');
  process.exit(1);
}

const bySlug = new Map(backup.map((item) => [item.slug, item]));
let restored = 0;

for (const item of current) {
  if (slugFilter && !slugFilter.includes(item.slug)) continue;
  const prev = bySlug.get(item.slug);
  if (!prev) continue;

  if (fields.includes('images') && Array.isArray(prev.images) && prev.images.length) {
    item.images = [...prev.images];
    restored++;
    console.log(`  images: ${item.slug} (${prev.images.length} paths)`);
  }
  if (fields.includes('model3d') && prev.model3d) {
    item.model3d = prev.model3d;
    console.log(`  model3d: ${item.slug} → ${prev.model3d}`);
  }
}

console.log(`restore-katalog: ${restored} item field(s) from ${path.basename(backupPath)}`);

if (WRITE) {
  const stamp = new Date().toISOString().replace(/[:.]/g, '');
  const backupOut = `${targetPath}.before-restore.${stamp}.json`;
  fs.copyFileSync(targetPath, backupOut);
  fs.writeFileSync(targetPath, JSON.stringify(current, null, 2) + '\n');
  console.log(`Written ${targetPath}`);
  console.log(`Safety backup: ${backupOut}`);
} else {
  console.log('Dry run. Pass --write to apply.');
}

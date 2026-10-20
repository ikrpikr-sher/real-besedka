#!/usr/bin/env node
/**
 * Добавить в katalog.json дворовые фото с диска, убрать interior/proekty.
 * Сохраняет порядок уже заданный в JSON; новые файлы — в конец (по yardFileOrder).
 *
 * Если в JSON почти нет фото (<3), а на диске полный набор — собирает список с диска.
 *
 * Usage: node scripts/sync-yard-photos.mjs [--write] [--file path] [--slugs b-41,b-42]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  EXCLUDED_IMAGE,
  catalogImageDir,
  normalizeCatalogImages,
  stripQuery,
} from '../lib/catalogImagesCore.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const WRITE = process.argv.includes('--write');
const fileArg = process.argv.find((a, i) => process.argv[i - 1] === '--file');
const slugsArg = process.argv.find((a, i) => process.argv[i - 1] === '--slugs');
const slugFilter = slugsArg?.split(',').map((s) => s.trim()).filter(Boolean);
const KATALOG = fileArg ? path.resolve(fileArg) : path.join(ROOT, 'data/katalog.json');
const PUBLIC = path.join(ROOT, 'public');

function yardFileOrder(name) {
  const n = name.toLowerCase();
  if (/^02[-_]hero|^01_hero/.test(n)) return 10;
  if (/^06[-_]hero|^05_hero/.test(n)) return 20;
  if (/^01[-_]front|^02_front/.test(n)) return 30;
  if (/^03[-_]left|^03_left/.test(n)) return 40;
  if (/^04[-_]right|^04_right/.test(n)) return 50;
  if (/^05[-_]back|^06_back|^08[-_]roof/.test(n)) return 60;
  if (/^11[-_]seat/.test(n)) return 65;
  if (/dvor/.test(n)) return 70;
  if (/fasad/.test(n)) return 80;
  if (/levo/.test(n)) return 90;
  if (/pravo/.test(n)) return 100;
  return 150;
}

function listYardFiles(publicDir, category, slug) {
  const relDir = path.join('images', catalogImageDir(category, slug));
  const absDir = path.join(publicDir, relDir);
  if (!fs.existsSync(absDir) || !fs.statSync(absDir).isDirectory()) return [];

  return fs
    .readdirSync(absDir)
    .filter((name) => /\.(jpe?g|png|webp)$/i.test(name) && !EXCLUDED_IMAGE.test(name))
    .sort((a, b) => yardFileOrder(a) - yardFileOrder(b) || a.localeCompare(b, 'ru'));
}

function toUrl(relDir, name) {
  return `/${relDir}/${name}`.replace(/\\/g, '/');
}

const items = JSON.parse(fs.readFileSync(KATALOG, 'utf8'));
let changed = 0;

for (const item of items) {
  if (slugFilter && !slugFilter.includes(item.slug)) continue;

  const relDir = path.join('images', catalogImageDir(item.category, item.slug));
  const diskFiles = listYardFiles(PUBLIC, item.category, item.slug);
  if (!diskFiles.length) continue;

  const before = item.images ?? [];
  const kept = before.filter((p) => {
    const base = stripQuery(p);
    return !EXCLUDED_IMAGE.test(base) && base.startsWith('/');
  });

  const diskUrls = diskFiles.map((f) => toUrl(relDir, f));
  const diskSet = new Set(diskUrls.map(stripQuery));

  // Убрать пути вне папки модели (proekty/interior-*)
  const inFolder = kept.filter((p) => {
    const base = stripQuery(p);
    return base.includes(`/${item.slug}/`) || base.includes(catalogImageDir(item.category, item.slug));
  });

  const validKept = inFolder.filter((p) => diskSet.has(stripQuery(p)));
  const missing = diskUrls.filter((u) => !validKept.some((k) => stripQuery(k) === stripQuery(u)));

  let next;
  if (validKept.length >= 3) {
    next = [...validKept, ...missing];
  } else {
    // Мало фото в JSON — полный набор с диска (типично b-41 после restore)
    next = diskUrls;
  }

  next = normalizeCatalogImages(next, { publicDir: PUBLIC, preserveOrder: true });

  if (JSON.stringify(before) !== JSON.stringify(next)) {
    changed++;
    console.log(
      `${item.slug}: ${before.length} → ${next.length} (${missing.length} added, ${before.length - validKept.length} removed)`,
    );
    item.images = next;
  }
}

console.log(`sync-yard-photos: ${changed} item(s) updated`);

if (WRITE && changed) {
  const backup = `${KATALOG}.before-yard-sync.${new Date().toISOString().replace(/[:.]/g, '')}.json`;
  fs.copyFileSync(KATALOG, backup);
  fs.writeFileSync(KATALOG, JSON.stringify(items, null, 2) + '\n');
  console.log(`Written ${KATALOG}`);
  console.log(`Backup: ${backup}`);
} else if (!WRITE) {
  console.log('Dry run. Pass --write to save.');
}

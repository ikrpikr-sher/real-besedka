#!/usr/bin/env node
/**
 * Удаляет тяжёлые PNG, если рядом уже есть .webp или .jpg (сайт их не использует).
 * Usage: node scripts/prune-catalog-png.mjs [--write] [--dir public/images]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const WRITE = process.argv.includes('--write');
const dirArg = process.argv.find((a, i) => process.argv[i - 1] === '--dir');
const TARGET = dirArg ? path.resolve(dirArg) : path.join(ROOT, 'public/images');
const SKIP_DIRS = new Set(['blog']);

let candidates = 0;
let removed = 0;
let saved = 0;

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      walk(abs);
      continue;
    }
    if (!/\.png$/i.test(entry.name)) continue;
    const stem = abs.slice(0, -4);
    const hasWebp = fs.existsSync(`${stem}.webp`);
    const hasJpg = fs.existsSync(`${stem}.jpg`);
    if (!hasWebp && !hasJpg) continue;

    const stat = fs.statSync(abs);
    candidates++;
    if (WRITE) {
      fs.unlinkSync(abs);
      removed++;
      saved += stat.size;
    } else {
      saved += stat.size;
    }
  }
}

walk(TARGET);

console.log(`PNG with webp/jpg sibling: ${candidates}`);
if (WRITE) {
  console.log(`Removed: ${removed}, saved ~${(saved / 1024 / 1024).toFixed(1)} MB`);
} else {
  console.log(`Would save ~${(saved / 1024 / 1024).toFixed(1)} MB (dry run, pass --write)`);
}

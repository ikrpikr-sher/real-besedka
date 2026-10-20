#!/usr/bin/env node
/**
 * Удаляет .jpg, если рядом уже есть .webp (сайт отдаёт webp первым).
 * Usage: node scripts/prune-catalog-jpg.mjs [--write] [--dir public/images]
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
    if (!/\.jpg$/i.test(entry.name)) continue;
    const stem = abs.slice(0, -4);
    if (!fs.existsSync(`${stem}.webp`)) continue;

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

console.log(`JPG with .webp sibling: ${candidates}`);
if (WRITE) {
  console.log(`Removed: ${removed}, saved ~${(saved / 1024 / 1024).toFixed(1)} MB`);
} else {
  console.log(`Would save ~${(saved / 1024 / 1024).toFixed(1)} MB (dry run, pass --write)`);
}

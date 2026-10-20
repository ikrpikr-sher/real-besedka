#!/usr/bin/env node
/**
 * Сжимает каталожные PNG/JPEG → рядом .webp и .jpg (max 1280px).
 * katalog.json не трогаем — сайт подхватывает .webp/.jpg через withImageCacheBust.
 *
 * Usage:
 *   node scripts/compress-catalog-images.mjs [--write] [--dir public/images/osteklenie]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const WRITE = process.argv.includes('--write');
const dirArg = process.argv.find((a, i) => process.argv[i - 1] === '--dir');
const TARGET = dirArg ? path.resolve(dirArg) : path.join(ROOT, 'public/images');
const MAX_WIDTH = 1280;
const CARD_WIDTH = 640;
const MIN_SOURCE_BYTES = 120_000;
const SKIP_DIRS = new Set(['blog', 'uzly']);
const IMAGE_EXT = /\.(png|jpe?g)$/i;
const CARDS_ONLY = process.argv.includes('--cards');

async function writeCardThumb(sharp, srcPath, dir, base) {
  const cardPath = path.join(dir, `${base}-card.webp`);
  await sharp(srcPath)
    .rotate()
    .resize({ width: CARD_WIDTH, withoutEnlargement: true })
    .webp({ quality: 76, effort: 4 })
    .toFile(cardPath);
  return cardPath;
}

async function main() {
  const sharp = (await import('sharp')).default;

  if (CARDS_ONLY) {
    const pending = [];
    function walkCards(dir) {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.name.startsWith('.')) continue;
        const abs = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (SKIP_DIRS.has(entry.name)) continue;
          walkCards(abs);
          continue;
        }
        if (entry.name.includes('-card.')) continue;
        if (!/\.(webp|jpe?g|png)$/i.test(entry.name)) continue;
        const base = entry.name.replace(/\.(webp|jpe?g|png)$/i, '');
        const cardPath = path.join(dir, `${base}-card.webp`);
        if (fs.existsSync(cardPath)) continue;
        if (fs.statSync(abs).size < 80_000) continue;
        if (WRITE) {
          pending.push(
            writeCardThumb(sharp, abs, dir, base).then(() => {
              console.log(`card: ${path.relative(ROOT, cardPath)}`);
            }),
          );
        } else {
          console.log(`would card: ${path.relative(ROOT, cardPath)}`);
        }
      }
    }
    walkCards(TARGET);
    if (WRITE) await Promise.all(pending);
    console.log(`Card thumbs: ${pending.length}`);
    return;
  }

  const files = [];

  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith('.')) continue;
      const abs = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (SKIP_DIRS.has(entry.name)) continue;
        walk(abs);
        continue;
      }
      if (!IMAGE_EXT.test(entry.name)) continue;
      if (/\.(webp|jpg)$/i.test(entry.name)) continue;
      files.push(abs);
    }
  }

  walk(TARGET);

  let created = 0;
  let skipped = 0;
  let saved = 0;

  for (const srcPath of files) {
    const stat = fs.statSync(srcPath);
    if (stat.size < MIN_SOURCE_BYTES) {
      skipped++;
      continue;
    }

    const dir = path.dirname(srcPath);
    const base = path.basename(srcPath).replace(IMAGE_EXT, '');
    const webpPath = path.join(dir, `${base}.webp`);
    const jpgPath = path.join(dir, `${base}.jpg`);

    const pipeline = sharp(srcPath).rotate().resize({
      width: MAX_WIDTH,
      withoutEnlargement: true,
    });

    if (WRITE) {
      await pipeline.clone().webp({ quality: 82, effort: 4 }).toFile(webpPath);
      await pipeline.clone().jpeg({ quality: 82, mozjpeg: true }).toFile(jpgPath);
      await writeCardThumb(sharp, webpPath, dir, base);
    }

    const webpSize = WRITE ? fs.statSync(webpPath).size : 0;
    const jpgSize = WRITE ? fs.statSync(jpgPath).size : 0;
    const best = Math.min(webpSize || stat.size, jpgSize || stat.size);

    if (WRITE && best < stat.size) {
      created++;
      saved += stat.size - best;
      console.log(
        `${path.relative(ROOT, srcPath)}: ${(stat.size / 1024).toFixed(0)}K → webp ${(webpSize / 1024).toFixed(0)}K, jpg ${(jpgSize / 1024).toFixed(0)}K`,
      );
    } else if (!WRITE) {
      console.log(`would compress: ${path.relative(ROOT, srcPath)} (${(stat.size / 1024).toFixed(0)}K)`);
      created++;
    } else {
      skipped++;
    }
  }

  console.log('');
  console.log(`Files scanned: ${files.length}`);
  console.log(`Optimized: ${created}, skipped: ${skipped}`);
  if (WRITE && saved > 0) console.log(`Saved ~${(saved / 1024 / 1024).toFixed(1)} MB vs originals (per-format best)`);
  if (!WRITE) console.log('Dry run. Pass --write to generate .webp/.jpg');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

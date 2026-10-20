#!/usr/bin/env node
/**
 * Проставляет водяной знак на все фото в public/images/.
 * 4 надписи по диагонали, прозрачность 40%.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDiagonalWatermarkSvg } from '../lib/watermarkSvgCore.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const IMAGES = path.join(ROOT, 'public', 'images');
const DRY = process.argv.includes('--dry-run');

const WATERMARK_LABEL = (process.env.WATERMARK_TEXT || 'real-besedki.ru').trim();
const MIN_WIDTH = 360;
const SUPPORTED = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const SKIP_NAME = /(?:^|\/)(?:logo|favicon|icon|hero-besedka)(?:[.-]|$)|[-_]alpha(?:\.|$)|\/textures\//i;
const SKIP_DIR = /(?:^|\/)(?:_backup|textures)(?:\/|$)/i;

function shouldProcess(rel) {
  const ext = path.extname(rel).toLowerCase();
  if (!SUPPORTED.has(ext)) return false;
  const norm = rel.replace(/\\/g, '/');
  if (SKIP_NAME.test(norm) || SKIP_DIR.test(norm)) return false;
  return true;
}

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

async function applyWatermark(sharp, absPath) {
  const meta = await sharp(absPath).metadata();
  if (!meta.width || !meta.height || meta.width < MIN_WIDTH) return false;

  const wmPng = await sharp(buildDiagonalWatermarkSvg(WATERMARK_LABEL, meta.width, meta.height))
    .png()
    .toBuffer();

  const tmp = `${absPath}.watermark.tmp`;
  const ext = path.extname(absPath).toLowerCase();
  const base = sharp(absPath).composite([{ input: wmPng, top: 0, left: 0, blend: 'over' }]);

  if (ext === '.jpg' || ext === '.jpeg') {
    await base.jpeg({ quality: 90, mozjpeg: true }).toFile(tmp);
  } else if (ext === '.webp') {
    await base.webp({ quality: 90 }).toFile(tmp);
  } else {
    await base.png({ compressionLevel: 9 }).toFile(tmp);
  }

  fs.renameSync(tmp, absPath);
  fs.chmodSync(absPath, 0o664);
  return true;
}

async function main() {
  const sharp = (await import('sharp')).default;
  const files = walk(IMAGES).filter((f) => shouldProcess(path.relative(IMAGES, f)));

  console.log(
    `Watermark: "${WATERMARK_LABEL}" · 4× diagonal · opacity 40% · ${files.length} file(s)`,
  );
  if (DRY) {
    files.slice(0, 20).forEach((f) => console.log(' ', path.relative(IMAGES, f)));
    if (files.length > 20) console.log(`  … and ${files.length - 20} more`);
    return;
  }

  let done = 0;
  let skip = 0;
  let fail = 0;
  for (const file of files) {
    try {
      const ok = await applyWatermark(sharp, file);
      if (ok) {
        done++;
        if (done % 50 === 0) console.log(`  ${done}/${files.length}…`);
      } else skip++;
    } catch (err) {
      fail++;
      console.error('FAIL', path.relative(IMAGES, file), err.message);
    }
  }
  console.log(`Done: ${done} watermarked, ${skip} skipped, ${fail} failed`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

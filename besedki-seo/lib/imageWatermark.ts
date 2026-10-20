import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const require = createRequire(import.meta.url);
const { buildDiagonalWatermarkSvg } = require('./watermarkSvgCore.mjs');

/** Текст водяного знака. */
export const WATERMARK_LABEL = process.env.WATERMARK_TEXT?.trim() || 'real-besedki.ru';

const MIN_WIDTH = 360;
const SUPPORTED = new Set(['.jpg', '.jpeg', '.png', '.webp']);

/** Пути/имена без водяного знака (логотип, иконки, превью панелей). */
const SKIP_NAME = /(?:^|\/)(?:logo|favicon|icon|hero-besedka)(?:[.-]|$)|[-_]alpha(?:\.|$)|\/textures\//i;
const SKIP_DIR = /(?:^|\/)(?:_backup|textures)(?:\/|$)/i;

export function isWatermarkableImage(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase();
  if (!SUPPORTED.has(ext)) return false;
  const rel = filePath.replace(/\\/g, '/');
  if (SKIP_NAME.test(rel) || SKIP_DIR.test(rel)) return false;
  return true;
}

/** Накладывает водяной знак in-place. Возвращает true, если файл изменён. */
export async function applyWatermarkToFile(absPath: string): Promise<boolean> {
  if (!fs.existsSync(absPath) || !isWatermarkableImage(absPath)) {
    return false;
  }

  const meta = await sharp(absPath).metadata();
  if (!meta.width || !meta.height || meta.width < MIN_WIDTH) {
    return false;
  }

  const wmPng = await sharp(buildDiagonalWatermarkSvg(WATERMARK_LABEL, meta.width, meta.height))
    .png()
    .toBuffer();

  const tmp = `${absPath}.watermark.tmp`;
  const pipeline = sharp(absPath).composite([{ input: wmPng, top: 0, left: 0, blend: 'over' }]);

  const ext = path.extname(absPath).toLowerCase();
  if (ext === '.jpg' || ext === '.jpeg') {
    await pipeline.jpeg({ quality: 90, mozjpeg: true }).toFile(tmp);
  } else if (ext === '.webp') {
    await pipeline.webp({ quality: 90 }).toFile(tmp);
  } else {
    await pipeline.png({ compressionLevel: 9 }).toFile(tmp);
  }

  fs.renameSync(tmp, absPath);
  fs.chmodSync(absPath, 0o664);
  return true;
}

/** public/images/{folder}/file.jpg → абсолютный путь. */
export function publicImagePathFromUrl(urlPath: string): string | null {
  if (!urlPath.startsWith('/images/')) return null;
  const clean = urlPath.split('?')[0];
  return path.join(process.cwd(), 'public', clean.replace(/^\//, ''));
}

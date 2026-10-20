import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const core = require('./catalogImagesCore.mjs') as typeof import('./catalogImagesCore.mjs');

export const EXCLUDED_IMAGE = core.EXCLUDED_IMAGE;
export const heroScore = core.heroScore;
export const normalizeCatalogImages = core.normalizeCatalogImages;
export const pickCatalogCardImage = core.pickCatalogCardImage;
export const discoverYardImages = core.discoverYardImages;

const PUBLIC_DIR = path.join(process.cwd(), 'public');

function resolveOptimizedImagePath(base: string): string {
  const rel = base.replace(/^\//, '');
  const ext = path.extname(rel);
  const stem = rel.slice(0, -ext.length);
  const webp = path.join(PUBLIC_DIR, `${stem}.webp`);
  const jpg = path.join(PUBLIC_DIR, `${stem}.jpg`);
  if (fs.existsSync(webp)) return `/${stem}.webp`;
  if (fs.existsSync(jpg)) return `/${stem}.jpg`;
  return base;
}

function cacheBustPath(publicPath: string): string {
  const filePath = path.join(PUBLIC_DIR, publicPath.replace(/^\//, ''));
  try {
    const mtime = fs.statSync(filePath).mtimeMs;
    return `${publicPath}?v=${Math.floor(mtime)}`;
  } catch {
    return publicPath;
  }
}

/** Cache-bust по mtime файла — сбрасывает закэшированные 404 после восстановления медиа. */
export function withImageCacheBust(url: string): string {
  const base = resolveOptimizedImagePath(url.split('?')[0]);
  return cacheBustPath(base);
}

/** Миниатюра для карточек каталога (~640px), если есть `-card.webp`. */
export function withCardImageCacheBust(url: string): string {
  const optimized = resolveOptimizedImagePath(url.split('?')[0]);
  const rel = optimized.replace(/^\//, '');
  const ext = path.extname(rel);
  const stem = rel.slice(0, -ext.length);
  const cardWebp = path.join(PUBLIC_DIR, `${stem}-card.webp`);
  if (fs.existsSync(cardWebp)) return cacheBustPath(`/${stem}-card.webp`);
  return cacheBustPath(optimized);
}

export function withImageCacheBustList(images: string[]): string[] {
  return images.map(withImageCacheBust);
}

/** Нормализует фото товара для сайта: фильтр interior/битых, порядок из админки сохраняется. */
export function normalizeItemImages(images: string[]): string[] {
  return core.normalizeCatalogImages(images, { publicDir: PUBLIC_DIR, preserveOrder: true });
}

export function pickCardImage(images: string[]): string | undefined {
  return core.pickCatalogCardImage(images, PUBLIC_DIR);
}

/** Путь для sitemap/SEO, если файл есть на диске (webp/jpg). */
export function publicImagePathIfExists(url: string): string | undefined {
  const clean = url.split('?')[0];
  const resolved = resolveOptimizedImagePath(clean);
  const candidates = [resolved, clean];
  for (const candidate of candidates) {
    const filePath = path.join(PUBLIC_DIR, candidate.replace(/^\//, ''));
    if (fs.existsSync(filePath)) return candidate;
  }
  return undefined;
}

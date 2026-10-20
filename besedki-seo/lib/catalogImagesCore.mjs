/** Нормализация фото каталога: дворовые рендеры первыми, без interior/узлов. */

import fs from 'node:fs';
import path from 'node:path';

/** Не показывать в карточках и галереях каталога. */
export const EXCLUDED_IMAGE = /interior|07_interior|08_panels|09_uzel|10_uzel|11_uzel|spec-interior|paneli\.jpg|mangal\.jpg|interior-/i;

/** Приоритет для сортировки (выше = раньше в списке). */
export function heroScore(url) {
  const p = url.split('?')[0];
  if (/01_hero|02-hero|02_hero/i.test(p)) return 100;
  if (/05_hero|06-hero|06_hero_left|05_hero_left/i.test(p)) return 95;
  if (/02_front|01-front/i.test(p)) return 90;
  if (/03_left|04_right|05_back|03-left|04-right|05-back/i.test(p)) return 85;
  if (/06_cooking|07_lifestyle/i.test(p)) return 70;
  if (/proekty\//i.test(p)) return 60;
  if (/dvor\.jpg|fasad\.jpg|levo\.jpg/i.test(p)) return 40;
  return 50;
}

export function stripQuery(url) {
  return url.split('?')[0];
}

/** PNG в katalog.json → webp/jpg на диске после конвертации. */
export function resolvePublicImagePath(publicDir, url) {
  if (!publicDir || !url.startsWith('/')) return stripQuery(url);
  const rel = stripQuery(url).replace(/^\//, '');
  const full = path.join(publicDir, rel);
  if (fs.existsSync(full)) return `/${rel}`.replace(/\\/g, '/');

  const ext = path.extname(rel);
  const stemRel = rel.slice(0, -ext.length);
  for (const altExt of ['.webp', '.jpg', '.jpeg', '.png']) {
    const candRel = `${stemRel}${altExt}`;
    if (fs.existsSync(path.join(publicDir, candRel))) {
      return `/${candRel}`.replace(/\\/g, '/');
    }
  }
  return null;
}

export function fileExists(publicDir, url) {
  if (!publicDir || !url.startsWith('/')) return true;
  return resolvePublicImagePath(publicDir, url) !== null;
}

/** Папка дворовых рендеров на диске (не совпадает с slug категории в URL). */
export function catalogImageDir(category, slug) {
  const n = Number(String(slug).replace(/^b-/, ''));
  if (category === 'besedki-s-ostekleniem') {
    if (n >= 31 && n <= 40) return `osteklenie-paneli/${slug}`;
    return `osteklenie/${slug}`;
  }
  if (category === 'besedki-osteklennye-loft') return `osteklenie/${slug}`;
  if (category === 'otkrytye-besedki' && n >= 41 && n <= 50) return `otkrytye-paneli/${slug}`;
  if (category === 'otkrytye-besedki') return `otkrytye-besedki/${slug}`;
  return `${category}/${slug}`;
}

export function discoverYardImages(publicDir, category, slug) {
  if (!publicDir || !category || !slug) return null;
  const relDir = path.join('images', catalogImageDir(category, slug));
  const absDir = path.join(publicDir, relDir);
  if (!fs.existsSync(absDir) || !fs.statSync(absDir).isDirectory()) return null;

  const urls = fs
    .readdirSync(absDir)
    .filter((name) => /\.(jpe?g|png|webp)$/i.test(name))
    .map((name) => `/${relDir}/${name}`.replace(/\\/g, '/'));

  const normalized = normalizeCatalogImages(urls, { publicDir, keepExcluded: false, preserveOrder: true });
  return normalized.length ? normalized : null;
}

/**
 * @param {string[]} images
 * @param {{ publicDir?: string, keepExcluded?: boolean, skipFileCheck?: boolean, preserveOrder?: boolean }} [opts]
 * preserveOrder по умолчанию true — порядок из админки не трогаем без явного --sort-hero.
 * @returns {string[]}
 */
export function normalizeCatalogImages(images, opts = {}) {
  const { publicDir, keepExcluded = false, skipFileCheck = false, preserveOrder = true } = opts;
  if (!Array.isArray(images) || images.length === 0) return [];

  const seen = new Set();
  const unique = [];

  for (const raw of images) {
    if (typeof raw !== 'string' || !raw.trim()) continue;
    const base = stripQuery(raw.trim());
    const resolved = skipFileCheck ? base : resolvePublicImagePath(publicDir, base);
    if (!resolved) continue;
    if (seen.has(resolved)) continue;
    if (!keepExcluded && EXCLUDED_IMAGE.test(resolved)) continue;
    seen.add(resolved);
    unique.push(resolved);
  }

  if (!preserveOrder) {
    unique.sort((a, b) => heroScore(b) - heroScore(a));
  }
  return unique;
}

/** Объединяет списки фото: порядок server, затем новые из patch. Без сортировки. */
export function mergeCatalogImageLists(server = [], patch = [], opts = {}) {
  const merged = [...(server ?? []), ...(patch ?? [])];
  return normalizeCatalogImages(merged, { ...opts, preserveOrder: true });
}

/** Добавить в конец дворовые файлы с диска, которых ещё нет в списке. Порядок не меняет. */
export function appendDiscoveredYardImages(existing, publicDir, category, slug) {
  const discovered = discoverYardImages(publicDir, category, slug);
  if (!discovered?.length) return existing ?? [];

  const seen = new Set((existing ?? []).map(stripQuery));
  const appended = [...(existing ?? [])];
  for (const url of discovered) {
    const base = stripQuery(url);
    if (seen.has(base)) continue;
    seen.add(base);
    appended.push(base);
  }
  return normalizeCatalogImages(appended, {
    publicDir,
    keepExcluded: false,
    skipFileCheck: false,
    preserveOrder: true,
  });
}

/** Первое фото для карточки каталога. */
export function pickCatalogCardImage(images, publicDir) {
  const normalized = normalizeCatalogImages(images, { publicDir, preserveOrder: true });
  return normalized[0];
}

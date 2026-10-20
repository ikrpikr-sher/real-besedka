import fs from 'node:fs';
import path from 'node:path';
import { normalizeItemImages } from './catalogImages';
import { readJson } from './contentStore';
import {
  catalogItemPath,
  inferCatalogCategory,
  isCatalogCategory,
  isUnpublishedCatalogCategory,
  type CatalogCategorySlug,
} from './catalogCategories';
import type { ServiceItem } from '@/app/api/admin/uslugi/route';
import type { MaterialItem } from '@/app/api/admin/materialy/route';

export type CatalogItem = {
  slug: string;
  category: CatalogCategorySlug;
  title: string;
  /** Короткий слоган для карточки каталога */
  tagline?: string;
  /** Профиль конфигуратора: standard | grafit-start | panorama | loft-beige-8x6 */
  configuratorId?: string;
  material: string;
  size: string;
  roof: string;
  foundation: string;
  priceFrom: number;
  description: string;
  /** Meta description карточки; если пусто — собирается из description */
  seoDescription?: string;
  images: string[];
  /** Путь к GLB, например /models/b-11.glb. Если пусто — из lib/catalogModels.ts */
  model3d?: string;
  /** Технические характеристики; если пусто — из lib/catalogSpecs.ts по slug */
  specs?: { label: string; value: string }[];
};

export type SiteConfig = typeof import('@/data/site.json');

/** Карточка 2ГИС. data/site.json на прод не едет — URL держим в коде. */
export const TWOGIS_FIRM_URL = 'https://2gis.ru/moscow/firm/70000001117280474';
export type HomeConfig = typeof import('@/data/home.json');
export type PaymentMethodsConfig = {
  title: string;
  intro?: string;
  items: { title: string; description: string }[];
};

export type KontaktyConfig = {
  title: string;
  intro: string;
  address: string;
  serviceArea: string;
  workHours: string;
  paymentMethods?: PaymentMethodsConfig;
};
export type OKompaniiConfig = typeof import('@/data/o-kompanii.json');
export type QuizConfig = typeof import('@/data/quiz.json');

const KATALOG_FILE = 'katalog.json';
const LEGACY_FILE = 'proekty.json';

function normalizeCatalogItem(raw: CatalogItem): CatalogItem {
  const category = inferCatalogCategory(raw);
  const images = normalizeItemImages(raw.images ?? []);
  return { ...raw, category, images };
}

function loadCatalogRaw(): CatalogItem[] {
  const dataDir = path.join(process.cwd(), 'data');
  const katalogPath = path.join(dataDir, KATALOG_FILE);
  const legacyPath = path.join(dataDir, LEGACY_FILE);

  if (fs.existsSync(katalogPath)) {
    return readJson<CatalogItem[]>(KATALOG_FILE)
      .filter((raw) => !isUnpublishedCatalogCategory(String(raw.category || '')))
      .map(normalizeCatalogItem);
  }

  if (fs.existsSync(legacyPath)) {
    return readJson<CatalogItem[]>(LEGACY_FILE).map(normalizeCatalogItem);
  }

  return [];
}

function getKatalogMtimeMs(): number | null {
  const katalogPath = path.join(process.cwd(), 'data', KATALOG_FILE);
  if (!fs.existsSync(katalogPath)) return null;
  return fs.statSync(katalogPath).mtimeMs;
}

let catalogCache: { mtimeMs: number; items: CatalogItem[] } | null = null;

export function clearCatalogCache(): void {
  catalogCache = null;
}

export function getKatalog(): CatalogItem[] {
  const mtimeMs = getKatalogMtimeMs();
  if (mtimeMs !== null && catalogCache?.mtimeMs === mtimeMs) {
    return catalogCache.items;
  }

  const items = loadCatalogRaw();
  if (mtimeMs !== null) {
    catalogCache = { mtimeMs, items };
  } else {
    catalogCache = null;
  }
  return items;
}

export function getKatalogByCategory(category: string): CatalogItem[] {
  if (!isCatalogCategory(category)) return [];
  return getKatalog().filter((item) => item.category === category);
}

export function getCatalogItem(category: string, slug: string): CatalogItem | undefined {
  if (!isCatalogCategory(category)) return undefined;
  return getKatalog().find((item) => item.category === category && item.slug === slug);
}

export function getCatalogItemBySlug(slug: string): CatalogItem | undefined {
  return getKatalog().find((item) => item.slug === slug);
}

export function getCatalogItemUrl(item: CatalogItem): string {
  return catalogItemPath(item.category, item.slug);
}

/** Артикул из slug: b-11 → B-11, k-33-poly → K-33-POLY */
export function getCatalogArticle(slug: string): string {
  return slug.toUpperCase();
}

/** @deprecated Use getKatalog() */
export function getProekty(): CatalogItem[] {
  return getKatalog();
}

/** @deprecated Use getCatalogItemBySlug() */
export function getProekt(slug: string): CatalogItem | undefined {
  return getCatalogItemBySlug(slug);
}

export function getSite(): SiteConfig {
  return readJson<SiteConfig>('site.json');
}

export function getHome(): HomeConfig {
  return readJson<HomeConfig>('home.json');
}

export function getUslugi(): ServiceItem[] {
  return readJson<ServiceItem[]>('uslugi.json');
}

export function getUsluga(slug: string): ServiceItem | undefined {
  return getUslugi().find((u) => u.slug === slug);
}

export function getMaterialy(): MaterialItem[] {
  return readJson<MaterialItem[]>('materialy.json');
}

export function getMaterial(slug: string): MaterialItem | undefined {
  return getMaterialy().find((m) => m.slug === slug);
}

export function getOKompanii(): OKompaniiConfig {
  return readJson<OKompaniiConfig>('o-kompanii.json');
}

export function getKontakty(): KontaktyConfig {
  return readJson<KontaktyConfig>('kontakty.json');
}

export function getQuiz(): QuizConfig {
  return readJson<QuizConfig>('quiz.json');
}

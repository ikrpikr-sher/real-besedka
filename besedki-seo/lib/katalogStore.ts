import fs from 'node:fs';
import path from 'node:path';
import { readJson, writeJson } from '@/lib/contentStore';
import { CATALOG_CATEGORIES, inferCatalogCategory, type CatalogCategorySlug } from '@/lib/catalogCategories';
import type { CatalogItem } from '@/lib/content';
import { assertCatalogWritable } from '@/lib/katalogValidation';

const FILE = 'katalog.json';
const LEGACY_FILE = 'proekty.json';

function normalizeItem(raw: CatalogItem): CatalogItem {
  return { ...raw, category: inferCatalogCategory(raw) };
}

export function readCatalogItems(): CatalogItem[] {
  const dataDir = path.join(process.cwd(), 'data');
  const katalogPath = path.join(dataDir, FILE);

  if (fs.existsSync(katalogPath)) {
    return readJson<CatalogItem[]>(FILE).map(normalizeItem);
  }

  const legacyPath = path.join(dataDir, LEGACY_FILE);
  if (fs.existsSync(legacyPath)) {
    const migrated = readJson<CatalogItem[]>(LEGACY_FILE).map(normalizeItem);
    writeJson(FILE, migrated);
    return migrated;
  }

  return [];
}

export function writeCatalogItems(items: CatalogItem[]): void {
  const normalized = items.map(normalizeItem);
  const previous = readCatalogItems();

  if (process.env.KATALOG_ALLOW_SHRINK !== '1') {
    assertCatalogWritable(normalized, previous);
  }

  writeJson(FILE, normalized);
}

/** Переставить товары: либо весь каталог, либо только внутри категории. */
export function reorderCatalogItems(
  items: CatalogItem[],
  orderedSlugs: string[],
  category?: CatalogCategorySlug,
): CatalogItem[] {
  const bySlug = new Map(items.map((item) => [item.slug, item]));

  for (const slug of orderedSlugs) {
    if (!bySlug.has(slug)) {
      throw new Error(`Неизвестный slug: ${slug}`);
    }
  }

  if (category) {
    const inCategory = items.filter((item) => item.category === category);
    if (orderedSlugs.length !== inCategory.length) {
      throw new Error('Список slug не совпадает с товарами категории');
    }
    for (const slug of orderedSlugs) {
      if (bySlug.get(slug)?.category !== category) {
        throw new Error(`Товар ${slug} не из категории ${category}`);
      }
    }
    const queue = orderedSlugs.map((slug) => bySlug.get(slug)!);
    return items.map((item) => (item.category === category ? queue.shift()! : item));
  }

  if (orderedSlugs.length !== items.length) {
    throw new Error('Нужен полный список slug каталога');
  }
  if (new Set(orderedSlugs).size !== items.length) {
    throw new Error('Дубликаты или пропуски в списке slug');
  }

  return orderedSlugs.map((slug) => bySlug.get(slug)!);
}

function parseSizeMeters(size: string): { area: number; maxFoot: number; height: number } {
  const match = size.match(/([\d,]+)\s*[×x]\s*([\d,]+)\s*[×x]\s*([\d,]+)/i);
  if (!match) return { area: 0, maxFoot: 0, height: 0 };
  const a = parseFloat(match[1].replace(',', '.'));
  const b = parseFloat(match[2].replace(',', '.'));
  const h = parseFloat(match[3].replace(',', '.'));
  return { area: a * b, maxFoot: Math.max(a, b), height: h };
}

function isStartItem(item: CatalogItem): boolean {
  return item.slug === 'b-10' || item.configuratorId === 'grafit-start';
}

function compareBySize(a: CatalogItem, b: CatalogItem): number {
  if (isStartItem(a) && !isStartItem(b)) return -1;
  if (!isStartItem(a) && isStartItem(b)) return 1;

  const sa = parseSizeMeters(a.size);
  const sb = parseSizeMeters(b.size);
  if (sa.area !== sb.area) return sa.area - sb.area;
  if (sa.maxFoot !== sb.maxFoot) return sa.maxFoot - sb.maxFoot;
  if (sa.height !== sb.height) return sa.height - sb.height;
  return a.slug.localeCompare(b.slug, 'ru');
}

/** Сортировка внутри категорий: «Старт» первым, далее по возрастанию площади основания. */
export function sortCatalogBySize(items: CatalogItem[]): CatalogItem[] {
  const categoryOrder = CATALOG_CATEGORIES.map((cat) => cat.slug);
  const buckets = new Map<string, CatalogItem[]>();

  for (const item of items) {
    const list = buckets.get(item.category) ?? [];
    list.push(item);
    buckets.set(item.category, list);
  }

  const sorted: CatalogItem[] = [];
  for (const category of categoryOrder) {
    const list = buckets.get(category);
    if (!list?.length) continue;
    sorted.push(...list.sort(compareBySize));
    buckets.delete(category);
  }

  for (const list of buckets.values()) {
    sorted.push(...list.sort(compareBySize));
  }

  return sorted;
}

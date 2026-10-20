import type { CatalogItem } from '@/lib/content';

/** Порядок узоров в каталоге качелей (K-01…K-24 = 12×2). */
export const KACHELI_PATTERN_ORDER = [
  'Богатыри',
  'Медведи',
  'Лоси',
  'Рыцари',
  'Олени',
  'Лесная жизнь',
  'Дамаск',
  'Александрия',
  'Вавилон',
  'Средняя Азия',
  'Древняя Русь',
  'Кавказ',
] as const;

/** Порядок «других» качелей (не серия «Графит») — новинки первыми. */
export const KACHELI_MORE_ORDER = [
  'k-25',
  'k-26',
  'k-28',
  'k-29',
  'k-30',
  'k-31',
  'k-32',
  'k-33',
  'k-33-poly',
  'k-34',
  'k-34-poly',
] as const;

export type KacheliPatternGroup = {
  pattern: string;
  twoSeater?: CatalogItem;
  threeSeater?: CatalogItem;
};

/** Серия K-01…K-24 — парные карточки «узор + 2/3 места». Остальные качели — обычные карточки. */
export function isKacheliGraphiteItem(item: CatalogItem): boolean {
  return /«Графит ·/.test(item.title);
}

export function getKacheliPatternName(title: string): string {
  const match = title.match(/«Графит · (.+?)»/);
  return match?.[1] ?? title.replace(/^Качели\s+/i, '');
}

/** Число карточек на /katalog/kacheli: 12 узоров «Графит» + отдельные модели. */
export function countKacheliListingCards(items: CatalogItem[]): number {
  return groupKacheliItems(items).length + items.filter((item) => !isKacheliGraphiteItem(item)).length;
}

export function isKacheliTwoSeater(item: CatalogItem): boolean {
  return /(^|\s)2\s*мест/i.test(item.tagline ?? '') || /1,6×1,2/.test(item.size);
}

/** Боковой ракурс — лазерная панель читается лучше, чем общий 3/4. */
export function getKacheliPatternImage(item: CatalogItem | undefined): string | undefined {
  if (!item?.images?.length) return undefined;
  const panel = item.images.find(
    (src) => src.includes('03-left') || src.includes('04-right') || src.includes('03-left.jpg'),
  );
  return panel ?? item.images[0];
}

export function groupKacheliItems(items: CatalogItem[]): KacheliPatternGroup[] {
  const byPattern = new Map<string, KacheliPatternGroup>();

  for (const item of items) {
    if (!isKacheliGraphiteItem(item)) continue;
    const pattern = getKacheliPatternName(item.title);
    const group = byPattern.get(pattern) ?? { pattern };
    if (isKacheliTwoSeater(item)) group.twoSeater = item;
    else group.threeSeater = item;
    byPattern.set(pattern, group);
  }

  const ordered: KacheliPatternGroup[] = [];
  for (const pattern of KACHELI_PATTERN_ORDER) {
    const group = byPattern.get(pattern);
    if (group) ordered.push(group);
  }

  for (const [pattern, group] of byPattern) {
    if (!KACHELI_PATTERN_ORDER.includes(pattern as (typeof KACHELI_PATTERN_ORDER)[number])) {
      ordered.push(group);
    }
  }

  return ordered;
}

/** Сортировка карточек «других» качелей — по KACHELI_MORE_ORDER, затем остальные. */
export function sortKacheliMoreItems(items: CatalogItem[]): CatalogItem[] {
  const rank = new Map(KACHELI_MORE_ORDER.map((slug, i) => [slug, i]));
  return [...items].sort((a, b) => {
    const ra = rank.get(a.slug as (typeof KACHELI_MORE_ORDER)[number]);
    const rb = rank.get(b.slug as (typeof KACHELI_MORE_ORDER)[number]);
    if (ra !== undefined && rb !== undefined) return ra - rb;
    if (ra !== undefined) return -1;
    if (rb !== undefined) return 1;
    return a.slug.localeCompare(b.slug, 'ru');
  });
}

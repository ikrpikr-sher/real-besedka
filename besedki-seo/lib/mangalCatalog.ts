import type { CatalogItem } from '@/lib/content';

export type BesedkaMangalGroup = {
  id: 'compact' | 'family' | 'large';
  title: string;
  hint: string;
  items: CatalogItem[];
};

export type MangalySection = {
  id: 'accessories' | 'zones';
  title: string;
  hint: string;
  items: CatalogItem[];
  groups?: MangalZoneGroup[];
};

export type MangalZoneGroup = {
  id: 'bar' | 'open' | 'paneled';
  title: string;
  hint: string;
  items: CatalogItem[];
};

const ZONE_GROUP_META: Record<MangalZoneGroup['id'], { title: string; hint: string }> = {
  bar: {
    title: 'Барные и компактные',
    hint: 'Узкие навесы и мангал-бары — для террасы или небольшого двора.',
  },
  open: {
    title: 'Открытые навесы',
    hint: 'Мангал под крышей без боковых панелей — жаровня, казан, дымоход.',
  },
  paneled: {
    title: 'С декоративными панелями',
    hint: 'Беседка или зона с лазерным орнаментом на боках — как серия «Огонь», но отдельным блоком.',
  },
};

const PANELED_ZONE_SLUGS = new Set(['m-09', 'm-10', 'm-11', 'm-15']);
const BAR_ZONE_SLUGS = new Set(['m-07', 'm-08', 'm-12', 'm-14']);

const BM_GROUP_META: Record<BesedkaMangalGroup['id'], { title: string; hint: string }> = {
  compact: {
    title: 'Компактные',
    hint: '3×2 и 3×3 м — для небольшого участка, стол на 4–6 человек.',
  },
  family: {
    title: 'Семейные',
    hint: '3×4 – 4×4 м — просторная зона отдыха с мангалом и панелями.',
  },
  large: {
    title: 'Большие',
    hint: 'От 5×4 м — для большой компании и просторного двора.',
  },
};

function parseFootprintArea(size: string): number {
  const match = size.match(/(\d+(?:,\d+)?)\s*[×x]\s*(\d+(?:,\d+)?)/);
  if (!match) return 0;
  const w = parseFloat(match[1].replace(',', '.'));
  const d = parseFloat(match[2].replace(',', '.'));
  return w * d;
}

function besedkaMangalGroupId(area: number): BesedkaMangalGroup['id'] {
  if (area <= 9) return 'compact';
  if (area <= 16) return 'family';
  return 'large';
}

export function isBesedkaMangalItem(item: CatalogItem): boolean {
  return item.slug.startsWith('bm-');
}

export function isMangalZoneItem(item: CatalogItem): boolean {
  return /^m-(0[5-9]|1[0-5])$/.test(item.slug);
}

export function isMangalAccessoryItem(item: CatalogItem): boolean {
  return /^m-0[1-4]$/.test(item.slug);
}

/** Только беседки BM — без мангальных зон M. */
export function filterBesedkiSMangalom(items: CatalogItem[]): CatalogItem[] {
  return items.filter(isBesedkaMangalItem);
}

export function groupBesedkiSMangalom(items: CatalogItem[]): BesedkaMangalGroup[] {
  const buckets = new Map<BesedkaMangalGroup['id'], CatalogItem[]>();

  for (const item of filterBesedkiSMangalom(items)) {
    const id = besedkaMangalGroupId(parseFootprintArea(item.size));
    const list = buckets.get(id) ?? [];
    list.push(item);
    buckets.set(id, list);
  }

  for (const list of buckets.values()) {
    list.sort((a, b) => parseFootprintArea(a.size) - parseFootprintArea(b.size));
  }

  return (['compact', 'family', 'large'] as const)
    .filter((id) => (buckets.get(id)?.length ?? 0) > 0)
    .map((id) => ({
      id,
      ...BM_GROUP_META[id],
      items: buckets.get(id)!,
    }));
}

const MANGAL_ZONE_ORDER = [
  'm-05',
  'm-07',
  'm-08',
  'm-12',
  'm-14',
  'm-06',
  'm-13',
  'm-09',
  'm-10',
  'm-11',
  'm-15',
] as const;

export function groupMangalyItems(items: CatalogItem[]): MangalySection[] {
  const accessories = items.filter(isMangalAccessoryItem);
  const zones = items.filter(isMangalZoneItem);

  zones.sort((a, b) => {
    const ai = MANGAL_ZONE_ORDER.indexOf(a.slug as (typeof MANGAL_ZONE_ORDER)[number]);
    const bi = MANGAL_ZONE_ORDER.indexOf(b.slug as (typeof MANGAL_ZONE_ORDER)[number]);
    if (ai === -1 && bi === -1) return a.priceFrom - b.priceFrom;
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  const sections: MangalySection[] = [];

  if (accessories.length > 0) {
    sections.push({
      id: 'accessories',
      title: 'Отдельные мангалы',
      hint: 'Чаша, мангал, барбекю — без навеса. Дымоход нужен только если ставите под кровлю беседки.',
      items: accessories,
    });
  }

  if (zones.length > 0) {
    sections.push({
      id: 'zones',
      title: 'Мангальные зоны',
      hint: 'Готовые зоны «Огонь» под навесом — бар, открытый навес или с панелями.',
      items: zones,
      groups: groupMangalZones(zones),
    });
  }

  return sections;
}

function groupMangalZones(zones: CatalogItem[]): MangalZoneGroup[] {
  const buckets = new Map<MangalZoneGroup['id'], CatalogItem[]>();

  for (const item of zones) {
    let id: MangalZoneGroup['id'] = 'open';
    if (PANELED_ZONE_SLUGS.has(item.slug)) id = 'paneled';
    else if (BAR_ZONE_SLUGS.has(item.slug)) id = 'bar';
    const list = buckets.get(id) ?? [];
    list.push(item);
    buckets.set(id, list);
  }

  return (['bar', 'open', 'paneled'] as const)
    .filter((id) => (buckets.get(id)?.length ?? 0) > 0)
    .map((id) => ({
      id,
      ...ZONE_GROUP_META[id],
      items: buckets.get(id)!,
    }));
}

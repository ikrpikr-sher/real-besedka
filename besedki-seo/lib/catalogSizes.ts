import type { CatalogItem } from '@/lib/content';
import { getKatalog } from '@/lib/content';

const GAZEBO_CATEGORIES = new Set(['otkrytye-besedki', 'besedki-s-ostekleniem']);

export type SizeHub = {
  slug: string;
  label: string;
  items: CatalogItem[];
};

export function footprintSlug(size: string): string | null {
  const match = size.match(/([\d,]+)\s*[×xXх]\s*([\d,]+)/);
  if (!match) return null;
  const a = String(parseFloat(match[1].replace(',', '.'))).replace(/\.0$/, '');
  const b = String(parseFloat(match[2].replace(',', '.'))).replace(/\.0$/, '');
  return `${a}x${b}`;
}

export function slugToLabel(slug: string): string {
  return slug.replace('x', '×');
}

export function getSizeHubs(): SizeHub[] {
  const map = new Map<string, CatalogItem[]>();
  for (const item of getKatalog()) {
    if (!GAZEBO_CATEGORIES.has(item.category)) continue;
    const slug = footprintSlug(item.size);
    if (!slug) continue;
    const list = map.get(slug) ?? [];
    list.push(item);
    map.set(slug, list);
  }

  return [...map.entries()]
    .filter(([, items]) => items.length >= 1)
    .sort((a, b) => a[0].localeCompare(b[0], undefined, { numeric: true }))
    .map(([slug, items]) => ({ slug, label: slugToLabel(slug), items }));
}

export function getSizeHub(slug: string): SizeHub | undefined {
  return getSizeHubs().find((hub) => hub.slug === slug);
}

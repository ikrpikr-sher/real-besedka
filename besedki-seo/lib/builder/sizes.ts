import type { CatalogItemLite } from '@/lib/builder/types';

export type SizeOption = {
  size: string;
  slug: string;
  priceFrom: number;
  /** Подпись в выпадающем списке (если отличается от size). */
  label?: string;
};

/** Уникальные размеры из каталога (первый slug на каждый size). */
export function getSizeOptions(items: CatalogItemLite[]): SizeOption[] {
  const seen = new Set<string>();
  const options: SizeOption[] = [];

  for (const item of items) {
    if (seen.has(item.size)) continue;
    seen.add(item.size);
    options.push({ size: item.size, slug: item.slug, priceFrom: item.priceFrom });
  }

  return options.sort((a, b) => a.priceFrom - b.priceFrom);
}

export function findItemBySize(items: CatalogItemLite[], size: string): CatalogItemLite | undefined {
  return items.find((item) => item.size === size);
}

export function findItemBySlug(items: CatalogItemLite[], slug: string): CatalogItemLite | undefined {
  return items.find((item) => item.slug === slug);
}

/** Открытые модели + «Старт» (пустой каркас B-10) первым пунктом. */
export function getOpenSizeOptions(
  items: CatalogItemLite[],
  startSlug: string,
): SizeOption[] {
  const start = items.find((item) => item.slug === startSlug);
  const rest = filterOpenConfiguratorItems(items, startSlug);
  const options = getSizeOptions(rest);

  if (!start) return options;

  return [
    {
      size: start.size,
      slug: start.slug,
      priceFrom: start.priceFrom,
      label: `Старт (пустой каркас) — ${start.size}`,
    },
    ...options,
  ];
}

export function sizeOptionLabel(opt: SizeOption): string {
  const title = opt.label ?? opt.size;
  return `${title} — от ${opt.priceFrom.toLocaleString('ru-RU')} ₽`;
}

/** Открытые модели для конфигуратора — без каркаса B-10 в основном списке. */
export function filterOpenConfiguratorItems(
  items: CatalogItemLite[],
  excludeSlug?: string,
): CatalogItemLite[] {
  return items.filter((item) => item.slug !== excludeSlug);
}

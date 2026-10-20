import type { CatalogCategorySlug } from '@/lib/catalogCategories';

/** Папка дворовых рендеров на диске (не совпадает с slug категории в URL). */
export function catalogImageDir(category: CatalogCategorySlug, slug: string): string {
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

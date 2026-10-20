import type { CatalogCategorySlug } from '@/lib/catalogCategories';
import type { CatalogItem } from '@/lib/content';

const PRODUCT_NOUN: Record<CatalogCategorySlug, string> = {
  'otkrytye-besedki': 'металлическая беседка',
  'besedki-s-ostekleniem': 'беседка с остеклением',
  'besedki-osteklennye-loft': 'остеклённая беседка лофт',
  'besedki-s-mangalom': 'беседка с мангалом',
  navesy: 'металлический навес',
  mangaly: 'мангальная зона',
  kacheli: 'садовые качели',
  pavilony: 'металлический павильон',
};

const ANGLE_RULES: [RegExp, string][] = [
  [/hero[_-]?left|05_hero_left/i, 'вид ¾ слева'],
  [/01_hero|(^|[_-])hero$/i, 'вид ¾'],
  [/02_front|(^|[_-])front$/i, 'фасад'],
  [/03_left|(^|[_-])left$/i, 'торец слева'],
  [/04_right|(^|[_-])right$/i, 'торец справа'],
  [/06_back|(^|[_-])back$/i, 'вид сзади'],
];

function fileStem(src: string): string {
  const file = src.split('?')[0].split('/').pop() ?? '';
  return file.replace(/\.[^.]+$/, '');
}

export function productNoun(category: CatalogCategorySlug): string {
  return PRODUCT_NOUN[category] ?? 'изделие';
}

export function imageAngleLabel(src: string, index = 0): string {
  const stem = fileStem(src);
  for (const [re, label] of ANGLE_RULES) {
    if (re.test(stem)) return label;
  }
  return index === 0 ? 'вид ¾' : `ракурс ${index + 1}`;
}

export function catalogImageAlt(
  item: Pick<CatalogItem, 'title' | 'size' | 'category'>,
  src: string,
  index = 0,
): string {
  const angle = imageAngleLabel(src, index);
  return `${item.title} — ${angle}, ${productNoun(item.category)} ${item.size}`;
}

export function catalogImageCaption(item: Pick<CatalogItem, 'title'>, src: string, index = 0): string {
  return `${item.title} — ${imageAngleLabel(src, index)}`;
}

export function catalogCardAlt(
  item: Pick<CatalogItem, 'title' | 'size' | 'category' | 'images'>,
  src?: string,
): string {
  const image = src || item.images?.[0] || '';
  return catalogImageAlt(item, image, 0);
}

export function catalogImageAlts(item: Pick<CatalogItem, 'title' | 'size' | 'category' | 'images'>): string[] {
  return (item.images ?? []).map((src, index) => catalogImageAlt(item, src, index));
}

export function catalogImageCaptions(item: Pick<CatalogItem, 'title' | 'images'>): string[] {
  return (item.images ?? []).map((src, index) => catalogImageCaption(item, src, index));
}

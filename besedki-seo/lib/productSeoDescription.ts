import { getCatalogCategory, type CatalogCategorySlug } from '@/lib/catalogCategories';
import type { CatalogItem } from '@/lib/content';

export const SEO_DESCRIPTION_MAX = 250;

export type ProductSeoSource = Pick<
  CatalogItem,
  'slug' | 'category' | 'title' | 'size' | 'material' | 'roof' | 'description' | 'seoDescription' | 'tagline'
>;

const KIND_LABEL: Record<CatalogCategorySlug, string> = {
  'otkrytye-besedki': 'Открытая металлическая беседка',
  'besedki-s-ostekleniem': 'Остеклённая металлическая беседка',
  'besedki-osteklennye-loft': 'Остеклённая беседка лофт',
  'besedki-s-mangalom': 'Беседка с мангалом',
  navesy: 'Металлический навес',
  mangaly: 'Мангал / мангальная зона',
  kacheli: 'Садовые качели из металла',
  pavilony: 'Металлический павильон',
};

function firstSentence(text: string): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (!clean) return '';
  const match = clean.match(/^(.{40,180}?[.!?])(?:\s|$)/);
  return (match?.[1] || clean.slice(0, 160)).trim();
}

function has(text: string, needle: string): boolean {
  return text.toLowerCase().includes(needle.toLowerCase());
}

function hasWord(text: string, needle: string): boolean {
  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?:^|[^\\p{L}])${escaped}(?:$|[^\\p{L}])`, 'iu').test(text);
}

function featureBits(item: ProductSeoSource): string[] {
  const blob = `${item.title} ${item.tagline ?? ''} ${item.description}`;
  const bits: string[] = [];

  if (has(blob, '80×80') || has(blob, '80x80')) bits.push('каркас 80×80×3 мм');
  else if (item.material) {
    const shortMaterial = item.material.split(',')[0].trim();
    if (shortMaterial && shortMaterial.length <= 40) bits.push(shortMaterial);
  }

  if (has(blob, 'чпу') || has(blob, 'лазер')) bits.push('панели ЧПУ');
  const mentionsGlazing = has(blob, 'стеклопакет') || has(blob, 'остеклен');
  const noGlazing = has(blob, 'без остекл');
  if (mentionsGlazing && !noGlazing) bits.push('раздвижное остекление');
  if (has(blob, 'мангал') || item.category === 'besedki-s-mangalom') bits.push('зона жарки');
  if (has(blob, 'фанер') && hasWord(blob, 'пол')) bits.push('пол фанера в базе');
  else if (has(blob, 'дпк') && item.category === 'besedki-s-mangalom') bits.push('пол ДПК');

  if (item.roof && !has(item.roof, '—')) bits.push(item.roof.toLowerCase().includes('черепиц') ? 'металлочерепица' : item.roof);

  return [...new Set(bits)].slice(0, 3);
}

function clip(text: string, max = SEO_DESCRIPTION_MAX): string {
  const compact = text.replace(/\s+/g, ' ').trim();
  if (compact.length <= max) return compact;
  const cut = compact.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 120 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}

/** Собирает уникальный сниппет из полей карточки. Цену не выдумывает и не пишет. */
export function buildProductSeoDescription(item: ProductSeoSource): string {
  const kind = KIND_LABEL[item.category] || 'Металлическое изделие';
  const article = item.slug.trim().toUpperCase();
  const size = item.size?.trim();
  const features = featureBits(item);
  const categoryHint = getCatalogCategory(item.category)?.shortTitle;

  const head = [kind, article ? `«${article}»` : '', size ? size : ''].filter(Boolean).join(' ');
  const mid = features.length ? `${features.join(', ')}.` : firstSentence(item.description);
  const tail = 'Производство и монтаж в Москве и МО. Расчёт по заявке.';

  const draft = clip(`${head}: ${mid} ${tail}`.replace(/:\s+\./, ':'));
  if (draft.length >= 110) return draft;

  return clip(
    `${head}. ${item.tagline || firstSentence(item.description) || categoryHint || 'Каркас 80×80, порошок.'} ${tail}`,
  );
}

/** Для meta: ручной seoDescription, иначе функция. */
export function getProductMetaDescription(item: ProductSeoSource): string {
  const custom = item.seoDescription?.trim();
  if (custom) return clip(custom);
  return buildProductSeoDescription(item);
}

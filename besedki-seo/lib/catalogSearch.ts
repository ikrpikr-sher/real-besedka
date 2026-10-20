import { getCatalogCategory } from '@/lib/catalogCategories';
import type { CatalogItem } from '@/lib/content';
import { getCatalogArticle } from '@/lib/content';

export type CatalogSearchResult = {
  item: CatalogItem;
  score: number;
};

const ARTICLE_HOMOGLYPHS: Record<string, string> = {
  а: 'a',
  в: 'b',
  б: 'b',
  с: 'c',
  е: 'e',
  к: 'k',
  м: 'm',
  н: 'n',
  о: 'o',
  р: 'p',
  т: 't',
  у: 'u',
  х: 'x',
};

/** В51, В-53, К24 → латиница для артикулов B-/K-. */
function latinizeArticleChars(value: string): string {
  return value.replace(/[абвекмнопрстух]/g, (char) => ARTICLE_HOMOGLYPHS[char] ?? char);
}

function isArticleToken(token: string): boolean {
  return /^[бвbkк][-\s]?\d/.test(token);
}

function normalizeArticleToken(token: string): string {
  const latin = latinizeArticleChars(token);
  return latin.replace(/^([bk])[\s-]*(\d)/, '$1-$2');
}

function articleTokenVariants(token: string): string[] {
  const latin = latinizeArticleChars(token);
  const variants = new Set<string>([token, latin, normalizeArticleToken(token)]);

  const match = latin.match(/^([bk])[\s-]*(\d[\da-z-]*)/i);
  if (match) {
    const prefix = match[1].toLowerCase();
    const digits = match[2].replace(/\s/g, '');
    variants.add(`${prefix}-${digits}`);
    variants.add(`${prefix}${digits}`);
    variants.add(`${prefix}-${digits.replace(/-/g, '')}`);
  }

  return [...variants];
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/,/g, '.')
    .replace(/×/g, 'x')
    .replace(/(\d)\.0+(?=[x\s]|$)/g, '$1')
    .replace(/[«»"'.,;:()\-–—]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const QUERY_SYNONYMS: Record<string, string> = {
  loft: 'лофт',
  panorama: 'панорама',
  mangal: 'мангал',
  grapit: 'графит',
  grafite: 'графит',
  naves: 'навес',
  kacheli: 'качели',
  besedka: 'беседка',
  besedki: 'беседки',
};

function tokenize(query: string): string[] {
  const normalized = normalizeText(query).replace(/\bна\b/g, ' ');
  return normalized
    .split(' ')
    .map((token) => token.trim())
    .filter((token) => token.length >= 2 || isArticleToken(token))
    .map((token) => {
      if (isArticleToken(token)) return normalizeArticleToken(token);
      return QUERY_SYNONYMS[token] ?? token;
    });
}

function itemHaystack(item: CatalogItem): string {
  const category = getCatalogCategory(item.category);
  return normalizeText(
    [
      item.title,
      item.tagline,
      item.description,
      item.size,
      item.slug,
      getCatalogArticle(item.slug),
      item.material,
      item.roof,
      category?.title,
      category?.shortTitle,
    ]
      .filter(Boolean)
      .join(' '),
  );
}

function compactArticle(value: string): string {
  return value.replace(/[\s-]/g, '');
}

function tokenMatchesHaystack(token: string, haystack: string, item: CatalogItem): boolean {
  if (haystack.includes(token)) return true;

  for (const variant of articleTokenVariants(token)) {
    if (haystack.includes(variant)) return true;

    const article = normalizeText(getCatalogArticle(item.slug));
    const slug = normalizeText(item.slug);
    const compactArticleValue = compactArticle(article);
    const compactSlug = compactArticle(slug);
    const compactVariant = compactArticle(variant);

    if (article.includes(variant) || slug.includes(variant)) return true;
    if (
      compactArticleValue === compactVariant ||
      compactSlug === compactVariant ||
      compactArticleValue.includes(compactVariant) ||
      compactSlug.includes(compactVariant)
    ) {
      return true;
    }
  }

  if (token.length >= 3) {
    return haystack.split(' ').some((word) => word.startsWith(token));
  }

  return false;
}

function scoreItem(item: CatalogItem, tokens: string[], haystack: string): number {
  let score = 0;

  for (const token of tokens) {
    if (!tokenMatchesHaystack(token, haystack, item)) return 0;

    score += 10;

    const title = normalizeText(item.title);
    const slug = normalizeText(item.slug);
    const article = normalizeText(getCatalogArticle(item.slug));
    const size = normalizeText(item.size);
    const compactSlug = compactArticle(slug);
    const compactArticleValue = compactArticle(article);
    const compactToken = compactArticle(token);

    if (title.includes(token)) score += 20;
    if (
      slug.includes(token) ||
      article.includes(token) ||
      compactSlug === compactToken ||
      compactArticleValue === compactToken
    ) {
      score += 15;
    }
    if (size.includes(token)) score += 8;
  }

  return score;
}

export function searchCatalog(items: CatalogItem[], query: string, limit = 48): CatalogSearchResult[] {
  const tokens = tokenize(query);
  if (tokens.length === 0) return [];

  const results = items
    .map((item) => {
      const haystack = itemHaystack(item);
      const score = scoreItem(item, tokens, haystack);
      return score > 0 ? { item, score } : null;
    })
    .filter((result): result is CatalogSearchResult => result !== null)
    .sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title, 'ru'))
    .slice(0, limit);

  return results;
}

export const CATALOG_SEARCH_HINTS = [
  'Loft 3×4',
  'В-53',
  'беседка с мангалом',
  '3×4',
  'Панорама',
  'навес',
] as const;

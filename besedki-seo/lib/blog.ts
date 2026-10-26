import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { shouldNoindexBlogPost } from '@/lib/blogSeoPolicy';

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog');

export type FaqItem = { question: string; answer: string };

export type PostFrontmatter = {
  title: string;
  description: string;
  date: string;
  updated?: string;
  author: string;
  authorRole?: string;
  category: string;
  tags: string[];
  coverImage?: string;
  videoUrl?: string;
  videoUrls?: string[];
  faq?: FaqItem[];
  /** Попадать в RSS Дзена. По умолчанию — да, если есть обложка. */
  dzen?: boolean;
};

export type Post = PostFrontmatter & {
  slug: string;
  content: string;
};

export const BLOG_CATEGORY_LABELS: Record<string, string> = {
  'kak-vybrat': 'Как выбрать',
  sravneniya: 'Сравнения',
  'proekty-i-idei': 'Проекты и идеи',
  'montazh-i-uhod': 'Монтаж и уход',
  stili: 'Стили',
  'katalog-serii': 'Каталог серий',
  konstrukciya: 'Конструкция',
  'mangal-i-ogon': 'Мангал и огонь',
  razmery: 'Размеры',
  'zakaz-i-dogovor': 'Заказ и договор',
  'zakaz-i-montazh': 'Заказ и монтаж',
};

export function blogCategoryLabel(slug: string): string {
  return BLOG_CATEGORY_LABELS[slug] || slug.replace(/-/g, ' ');
}

export function blogTagLabel(tag: string): string {
  try {
    return decodeURIComponent(tag).replace(/-/g, ' ');
  } catch {
    return tag.replace(/-/g, ' ');
  }
}

/** Decode URL/path segment for blog category or tag (handles %D0%… and '+'). */
export function decodeBlogParam(value: string): string {
  try {
    return decodeURIComponent(value.replace(/\+/g, ' '));
  } catch {
    return value;
  }
}

export function getAllSlugs(): string[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((file) => file.endsWith('.mdx'))
    .map((file) => file.replace(/\.mdx$/, ''));
}

export function getPostBySlug(slug: string): Post {
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`);
  const raw = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(raw);
  return { slug, content, ...(data as PostFrontmatter) };
}

/** Жёсткий топ ленты: лазерная сварка → резка → пескоструй → пошив. */
export const PINNED_BLOG_SLUGS: readonly string[] = [
  'lazernaya-svarka-proizvodstvo-besedok',
  'lazernaya-rezka-tochnost-proizvodstva-besedok',
  'peskostruynaya-obrabotka-metallicheskoy-besedki',
  'poshiv-shtor-dlya-besedok',
];

/** Старые заводские статьи — после закреплённых, выше массового импорта. */
export const LEGACY_BLOG_SLUGS: readonly string[] = [
  'pokrytie-metallicheskoy-besedki-poroshkovaya-kraska',
  'osteklenie-ili-myagkie-okna-dlya-besedki',
  'montazh-besedki-na-svai-ili-fundament',
  'besedka-otkrytaya-ili-zakrytaya-chto-luchshe',
  'dpk-poly-dlya-besedki-preimushchestva',
  'metalicheskaya-besedka-pod-klyuch-moskva',
  'stili-besedok-loft-i-dizayn',
  'fundament-dlya-besedki-kakoy-vybrat',
  'kak-opredelit-razmer-besedki',
  'besedka-derevo-ili-metall-sravnenie',
  'kak-vybrat-besedku-dlya-dachi',
  'besedka-s-mangalom-ili-zona',
  'besedka-3x4-razmer-modeli',
  'besedka-loft-pod-fasad-doma',
  'skolko-stoit-metallicheskaya-besedka-pod-klyuch',
  'vintovye-svai-pod-besedku-moskovskaya-oblast',
  'zimnyaya-besedka-so-steklopaketom-panorama',
  'ventilyaciya-holodnogo-lofta-b-63',
];

export function getAllPosts(): Post[] {
  const pinnedIndex = new Map(PINNED_BLOG_SLUGS.map((slug, i) => [slug, i]));
  const legacyIndex = new Map(LEGACY_BLOG_SLUGS.map((slug, i) => [slug, i]));
  return getAllSlugs()
    .map((slug) => getPostBySlug(slug))
    .sort((a, b) => {
      const pa = pinnedIndex.get(a.slug);
      const pb = pinnedIndex.get(b.slug);
      if (pa !== undefined && pb !== undefined) return pa - pb;
      if (pa !== undefined) return -1;
      if (pb !== undefined) return 1;
      const la = legacyIndex.get(a.slug);
      const lb = legacyIndex.get(b.slug);
      if (la !== undefined && lb !== undefined) return la - lb;
      if (la !== undefined) return -1;
      if (lb !== undefined) return 1;
      return a.date < b.date ? -1 : a.date > b.date ? 1 : a.slug.localeCompare(b.slug);
    });
}

/** Для sitemap и листинга: без doorways вне Москва+МО. */
export function getIndexablePosts(): Post[] {
  return getAllPosts().filter((p) => !shouldNoindexBlogPost(p.slug, p.tags || []));
}

export function getPostsByCategory(category: string): Post[] {
  return getIndexablePosts().filter((p) => p.category === category);
}

export function getPostsByTag(tag: string): Post[] {
  return getIndexablePosts().filter((p) => p.tags?.includes(tag));
}

export function getAllCategories(): string[] {
  return Array.from(new Set(getIndexablePosts().map((p) => p.category)));
}

export function getAllTags(): string[] {
  return Array.from(new Set(getIndexablePosts().flatMap((p) => p.tags || [])));
}

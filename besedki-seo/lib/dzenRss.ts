import fs from 'node:fs';
import path from 'node:path';
import { blogCategoryLabel, getAllPosts, type FaqItem, type Post } from '@/lib/blog';
import { getSite } from '@/lib/content';

/** Живая выкладка первой волны. Не 153 сразу — дубли и спам. */
export const DZEN_RSS_AUTO_PUBLISH = true;

/** Заводские тексты, которых ещё нет на канале (6 ручных статей не повторяем). */
export const DZEN_RSS_WAVE: readonly string[] = [
  'boltovye-soedineniya-besedki',
  'profil-80x80-stena-3mm',
  'srok-sluzhby-metallicheskoy-besedki',
  'cink-grunt-i-poroshok',
  'ral-7016-grafit-besedka',
  'valma-krovli-22-gradusa',
  'snegovaya-nagruzka-besedki-mo',
  'sborka-besedki-za-odin-den',
  'pochemu-my-ne-shater',
  'lazernaya-rezka-tochnost-proizvodstva-besedok',
];

const DZEN_TITLE_MAX = 200;

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function enclosureType(src: string): string {
  const lower = src.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.gif')) return 'image/gif';
  if (lower.endsWith('.webp')) return 'image/webp';
  return 'image/jpeg';
}

function enclosureLength(absUrl: string): number {
  try {
    const pathname = new URL(absUrl).pathname;
    const file = path.join(process.cwd(), 'public', pathname);
    if (fs.existsSync(file)) return fs.statSync(file).size;
  } catch {
    /* cover may be remote-only */
  }
  return 0;
}

function parseDay(date: string): Date | null {
  const m = date.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 9, 0, 0));
  return Number.isNaN(d.getTime()) ? null : d;
}

const RFC_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
const RFC_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;

function formatRfc822MoscowNoon(utcDate: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${RFC_DAYS[utcDate.getUTCDay()]}, ${pad(utcDate.getUTCDate())} ${RFC_MONTHS[utcDate.getUTCMonth()]} ${utcDate.getUTCFullYear()} 12:00:00 +0300`;
}

function formatRfc822Instant(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const msk = new Date(d.getTime() + 3 * 60 * 60 * 1000);
  return `${RFC_DAYS[msk.getUTCDay()]}, ${pad(msk.getUTCDate())} ${RFC_MONTHS[msk.getUTCMonth()]} ${msk.getUTCFullYear()} ${pad(msk.getUTCHours())}:${pad(msk.getUTCMinutes())}:00 +0300`;
}

/** RFC-822. Будущие даты календаря пишем как «сегодня», чтобы автопубликация не ставила отложку. */
function rfc822(date: string, now = new Date()): string {
  let d = parseDay(date);
  if (!d || d.getTime() > now.getTime()) {
    d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0, 0));
  }
  return formatRfc822MoscowNoon(d);
}

/** Первая волна: сегодня +70 мин, дальше по одной в 12:00 МСК. Минимум отложки у Дзена — 1 час. */
function wavePubDate(index: number, now = new Date()): string {
  if (index <= 0) return formatRfc822Instant(new Date(now.getTime() + 70 * 60 * 1000));
  const msk = new Date(now.getTime() + 3 * 60 * 60 * 1000);
  const noonUtc = new Date(Date.UTC(msk.getUTCFullYear(), msk.getUTCMonth(), msk.getUTCDate() + index, 9, 0, 0));
  return formatRfc822MoscowNoon(noonUtc);
}

function cdata(html: string): string {
  return html.replace(/]]>/g, ']]]]><![CDATA[>');
}

function dzenTitle(title: string): string {
  const clean = title.replace(/\.$/, '').replace(/[^\S\n]+/g, ' ').trim();
  if (clean.length <= DZEN_TITLE_MAX) return clean;
  return `${clean.slice(0, DZEN_TITLE_MAX - 1).trim()}…`;
}

function absHref(href: string, siteBase?: string): string {
  if (/^https?:\/\//i.test(href)) return href;
  if (href.startsWith('/') && siteBase) return `${siteBase}${href}`;
  return '';
}

function inlineRich(text: string, siteBase?: string): string {
  return xmlEscape(text)
    .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_all, label: string, href: string) => {
      const abs = absHref(href, siteBase);
      return abs ? `<a href="${xmlEscape(abs)}">${label}</a>` : label;
    });
}

/** Внутри li Дзен не принимает вложенную разметку. */
function inlinePlain(text: string): string {
  return xmlEscape(text.replace(/\*\*(.+?)\*\*/g, '$1').replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1'));
}

function faqHtml(faq: FaqItem[] | undefined, siteBase?: string): string {
  if (!faq?.length) return '';
  const parts = ['<h2>Частые вопросы</h2>'];
  for (const item of faq) {
    parts.push(`<h3>${inlineRich(item.question, siteBase)}</h3>`);
    parts.push(`<p>${inlineRich(item.answer, siteBase)}</p>`);
  }
  return parts.join('\n');
}

/** Только теги, которые принимает Дзен. Без скриптов, iframe, видео. */
export function mdxToDzenHtml(markdown: string, coverAbs: string, title: string, siteBase?: string, faq?: FaqItem[]): string {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const out: string[] = [];
  out.push(
    `<figure><img src="${xmlEscape(coverAbs)}" width="1200" height="800" alt="${xmlEscape(title)}" /><figcaption>${xmlEscape(title)}</figcaption></figure>`,
  );
  let list: 'ul' | 'ol' | null = null;
  const flushList = () => {
    if (list) {
      out.push(`</${list}>`);
      list = null;
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      continue;
    }
    if (trimmed.startsWith('import ') || trimmed.startsWith('export ') || trimmed.startsWith('<Video')) {
      flushList();
      continue;
    }
    if (/^[-*]\s+/.test(trimmed)) {
      if (list !== 'ul') {
        flushList();
        list = 'ul';
        out.push('<ul>');
      }
      out.push(`<li>${inlinePlain(trimmed.replace(/^[-*]\s+/, ''))}</li>`);
      continue;
    }
    if (/^\d+\.\s+/.test(trimmed)) {
      if (list !== 'ol') {
        flushList();
        list = 'ol';
        out.push('<ol>');
      }
      out.push(`<li>${inlinePlain(trimmed.replace(/^\d+\.\s+/, ''))}</li>`);
      continue;
    }
    flushList();
    if (trimmed.startsWith('### ')) {
      out.push(`<h3>${inlineRich(trimmed.slice(4), siteBase)}</h3>`);
      continue;
    }
    if (trimmed.startsWith('## ')) {
      out.push(`<h2>${inlineRich(trimmed.slice(3), siteBase)}</h2>`);
      continue;
    }
    if (trimmed.startsWith('# ')) {
      out.push(`<h2>${inlineRich(trimmed.slice(2), siteBase)}</h2>`);
      continue;
    }
    if (/^!\[/.test(trimmed)) {
      const m = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)/);
      if (m) {
        const src = absHref(m[2], siteBase);
        if (src) {
          const alt = inlinePlain(m[1]);
          out.push(`<figure><img src="${xmlEscape(src)}" width="1200" height="800" alt="${alt}" /><figcaption>${alt}</figcaption></figure>`);
        }
      }
      continue;
    }
    out.push(`<p>${inlineRich(trimmed, siteBase)}</p>`);
  }
  flushList();
  const faqBlock = faqHtml(faq, siteBase);
  if (faqBlock) out.push(faqBlock);
  return out.join('\n');
}

export function postInDzenRss(post: Post): boolean {
  if (!post.coverImage) return false;
  if (post.dzen === false) return false;
  if (DZEN_RSS_WAVE.length > 0 && !DZEN_RSS_WAVE.includes(post.slug)) return false;
  return true;
}

export function buildDzenRssXml(): string {
  const site = getSite();
  const base = site.siteUrl.replace(/\/$/, '');
  const now = new Date();
  const waveRank = new Map(DZEN_RSS_WAVE.map((slug, i) => [slug, i]));
  const posts = getAllPosts()
    .filter(postInDzenRss)
    .sort((a, b) => (waveRank.get(a.slug) ?? 99) - (waveRank.get(b.slug) ?? 99));
  const items = posts.map((post, index) => {
    const url = `${base}/blog/${post.slug}`;
    const cover = `${base}${post.coverImage!.startsWith('/') ? post.coverImage : `/${post.coverImage}`}`;
    const html = mdxToDzenHtml(post.content, cover, post.title, base, post.faq);
    const length = enclosureLength(cover);
    const categories = [
      blogCategoryLabel(post.category),
      'noindex',
      'format-article',
      'comment-subscribers',
      DZEN_RSS_AUTO_PUBLISH ? undefined : 'native-draft',
    ].filter(Boolean) as string[];
    return [
      '    <item>',
      `      <title>${xmlEscape(dzenTitle(post.title))}</title>`,
      `      <link>${xmlEscape(url)}</link>`,
      `      <guid isPermaLink="true">${xmlEscape(url)}</guid>`,
      `      <pubDate>${DZEN_RSS_AUTO_PUBLISH ? wavePubDate(index, now) : rfc822(post.date, now)}</pubDate>`,
      `      <author>${xmlEscape(post.author)}</author>`,
      `      <description>${xmlEscape(post.description.slice(0, 240))}</description>`,
      `      <contentType>blogs_only</contentType>`,
      `      <enclosure url="${xmlEscape(cover)}" type="${enclosureType(cover)}"${length ? ` length="${length}"` : ''} />`,
      ...categories.map((c) => `      <category>${xmlEscape(c)}</category>`),
      `      <content:encoded><![CDATA[${cdata(html)}]]></content:encoded>`,
      '    </item>',
    ].join('\n');
  });

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:media="http://search.yahoo.com/mrss/">',
    '  <channel>',
    `    <title>${xmlEscape(`${site.siteName}: блог`)}</title>`,
    `    <link>${xmlEscape(base)}</link>`,
    `    <description>${xmlEscape('Металлические беседки под ключ: каркас 80×80, лофт, остекление. Производство ООО «Пулман», Москва и МО.')}</description>`,
    '    <language>ru</language>',
    `    <lastBuildDate>${rfc822(now.toISOString().slice(0, 10), now)}</lastBuildDate>`,
    `    <media:rating scheme="urn:simple">nonadult</media:rating>`,
    ...items,
    '  </channel>',
    '</rss>',
    '',
  ].join('\n');
}

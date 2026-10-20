import { getIndexablePosts } from '@/lib/blog';
import { publicImagePathIfExists } from '@/lib/catalogImages';
import { getCatalogItemUrl, getKatalog, getSite } from '@/lib/content';
import { catalogImageCaption, catalogImageAlt } from '@/lib/imageSeo';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function imageTag(loc: string, title: string, caption: string): string {
  return [
    '    <image:image>',
    `      <image:loc>${xmlEscape(loc)}</image:loc>`,
    `      <image:title>${xmlEscape(title)}</image:title>`,
    `      <image:caption>${xmlEscape(caption)}</image:caption>`,
    '    </image:image>',
  ].join('\n');
}

export function GET() {
  const site = getSite();
  const base = site.siteUrl.replace(/\/$/, '');
  const blocks: string[] = [];

  const hero = publicImagePathIfExists('/images/hero-besedka.webp');
  if (hero) {
    blocks.push(
      [
        '  <url>',
        `    <loc>${xmlEscape(`${base}/`)}</loc>`,
        imageTag(
          `${base}${hero}`,
          'Металлические беседки Real Besedki',
          'Дизайнерские металлические беседки, каркас 80×80, производство ООО «Пулман»',
        ),
        '  </url>',
      ].join('\n'),
    );
  }

  for (const item of getKatalog()) {
    const images = (item.images ?? [])
      .slice(0, 8)
      .map((src, index) => {
        const path = publicImagePathIfExists(src);
        if (!path) return null;
        return imageTag(
          `${base}${path}`,
          catalogImageCaption(item, src, index),
          catalogImageAlt(item, src, index),
        );
      })
      .filter((tag): tag is string => Boolean(tag));
    if (images.length === 0) continue;
    blocks.push(
      ['  <url>', `    <loc>${xmlEscape(`${base}${getCatalogItemUrl(item)}`)}</loc>`, ...images, '  </url>'].join(
        '\n',
      ),
    );
  }

  for (const post of getIndexablePosts()) {
    if (!post.coverImage) continue;
    const path = publicImagePathIfExists(post.coverImage);
    if (!path) continue;
    blocks.push(
      [
        '  <url>',
        `    <loc>${xmlEscape(`${base}/blog/${post.slug}`)}</loc>`,
        imageTag(`${base}${path}`, post.title, post.description || post.title),
        '  </url>',
      ].join('\n'),
    );
  }

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
    ...blocks,
    '</urlset>',
    '',
  ].join('\n');

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}

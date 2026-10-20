import { buildDzenRssXml } from '@/lib/dzenRss';

export const dynamic = 'force-dynamic';
export const revalidate = 300;

export function GET() {
  const xml = buildDzenRssXml();
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  });
}

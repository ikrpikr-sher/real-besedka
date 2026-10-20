import type { MetadataRoute } from 'next';
import { getSite } from '@/lib/content';

export default function robots(): MetadataRoute.Robots {
  const site = getSite();
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin/*', '/api/*'],
      },
      {
        userAgent: 'Mail.ru',
        allow: ['/', '/feeds/dzen.xml'],
        disallow: ['/admin', '/admin/*', '/api/*'],
        crawlDelay: 1,
      },
    ],
    sitemap: `${site.siteUrl}/sitemap.xml`,
  };
}

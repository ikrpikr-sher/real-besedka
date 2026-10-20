import type { MetadataRoute } from 'next';
import { CATALOG_CATEGORIES } from '@/lib/catalogCategories';
import { getKatalog, getMaterialy, getSite, getUslugi } from '@/lib/content';
import { getAllPosts, getAllCategories } from '@/lib/blog';
import { absoluteUrl, blogCategoryPath } from '@/lib/urlPath';

export const dynamic = 'force-dynamic';

export default function sitemap(): MetadataRoute.Sitemap {
  const site = getSite();
  const katalog = getKatalog();
  const uslugi = getUslugi();
  const materialy = getMaterialy();
  const base = site.siteUrl;
  const staticPages = [
    '',
    '/katalog',
    '/katalog/poisk',
    ...CATALOG_CATEGORIES.map((c) => `/katalog/${c.slug}`),
    // Коммерческие хабы — приоритет для топа (раньше не попадали в карту)
    '/kupit-metallicheskuyu-besedku',
    '/tseny-na-besedki',
    '/besedka-3x3',
    '/besedka-3x4',
    '/besedka-4x3',
    '/besedka-loft',
    '/osteklennaya-besedka',
    '/besedka-s-mangalom-pod-klyuch',
    '/besedka-4x4',
    '/besedka-2x3',
    '/besedka-5x4',
    '/besedka-5x5',
    '/zimnyaya-besedka',
    '/zakrytaya-besedka',
    '/otkrytaya-besedka',
    '/besedka-pod-klyuch',
    '/dostavka-i-montazh',
    '/metallicheskiy-naves',
    '/besedka-2x2',
    '/besedka-2-5x2-5',
    '/besedka-6x3',
    '/besedka-6x4',
    '/besedka-6x5',
    '/besedka-6x6',
    '/besedka-8x6',
    '/shestigrannaya-besedka',
    '/vosmigrannaya-besedka',
    '/mangalnaya-zona',
    '/barbekyu-zona',
    '/metallicheskiy-pavilon',
    '/sadovye-kacheli',
    '/kacheli',
    '/besedka-dlya-dachi',
    '/letnyaya-besedka',
    '/besedka-panorama',
    '/besedka-na-svayah',
    '/fundament-pod-besedku',
    '/proizvoditel-besedok',
    '/zakazat-besedku',
    '/besedka-iz-metalla',
    '/metallicheskaya-besedka',
    '/kupit-besedku',
    '/besedka-s-mangalnoy-zonoy',
    '/besedki-moskva',
    '/besedka-medvedi',
    '/besedka-oleni',
    '/besedka-bogatyri',
    '/besedka-damask',
    '/besedka-losi',
    '/besedka-rytsari',
    '/metallicheskie-besedki',
    '/besedka-iz-metalloprofilja',
    '/besedka-metall-ili-derevo',
    '/besedka-s-barbekyu',
    '/besedka-naves',
    '/faq',
    '/regiony',
    '/uslugi',
    '/materialy',
    '/o-kompanii',
    '/kontakty',
    '/blog',
    '/podbor-besedki',
    '/konfigurator',
    '/politika-konfidencialnosti',
  ];

  const entries: MetadataRoute.Sitemap = staticPages.map((p) => ({
    url: `${base}${p}`,
    changeFrequency: 'weekly' as const,
    priority: p === '' || p.startsWith('/besedka') || p.startsWith('/kupit') || p.startsWith('/tseny') || p.startsWith('/osteklen') || p.startsWith('/zimny') || p.startsWith('/zakryt') || p.startsWith('/otkryt') || p.startsWith('/dostavka') || p.startsWith('/metallicheskiy') || p.startsWith('/shesti') || p.startsWith('/vosmi') || p.startsWith('/mangal') || p.startsWith('/barbek') || p.startsWith('/sadovye') || p.startsWith('/letn') || p.startsWith('/fundament') || p.startsWith('/proizvoditel') || p.startsWith('/zakazat') || p === '/kacheli' || p === '/katalog'
      ? 0.9
      : 0.7,
  }));

  katalog.forEach((item) =>
    entries.push({
      url: `${base}/katalog/${item.category}/${item.slug}`,
      changeFrequency: 'weekly',
      priority: 0.8,
    }),
  );
  uslugi.forEach((u) => entries.push({ url: `${base}/uslugi/${u.slug}`, changeFrequency: 'monthly', priority: 0.5 }));
  materialy.forEach((m) => entries.push({ url: `${base}/materialy/${m.slug}`, changeFrequency: 'monthly', priority: 0.5 }));
  getAllPosts().forEach((post) =>
    entries.push({
      url: `${base}/blog/${post.slug}`,
      lastModified: post.updated || post.date,
      changeFrequency: 'monthly',
      priority: 0.4,
    }),
  );
  getAllCategories().forEach((c) =>
    entries.push({
      url: absoluteUrl(base, blogCategoryPath(c)),
      changeFrequency: 'weekly',
      priority: 0.5,
    }),
  );
  // Теги блога — thin после массового импорта: в sitemap не отдаём (страницы noindex).

  return entries;
}

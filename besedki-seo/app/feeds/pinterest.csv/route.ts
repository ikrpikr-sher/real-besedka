import { getKatalog, getSite } from '@/lib/content';
import { catalogItemPath } from '@/lib/catalogCategories';

const PRODUCT_TYPE: Record<string, string> = {
  'otkrytye-besedki': 'Беседки открытые',
  'besedki-s-ostekleniem': 'Беседки с остеклением',
  'besedki-osteklennye-loft': 'Беседки остеклённые лофт',
  'besedki-s-mangalom': 'Беседки с мангалом',
  navesy: 'Навесы',
  mangaly: 'Мангалы',
  kacheli: 'Качели',
  pavilony: 'Павильоны',
};

function csvCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

function plain(text: string, limit: number): string {
  const clean = (text || '')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return clean.length > limit ? `${clean.slice(0, limit - 1)}…` : clean;
}

export function GET() {
  const site = getSite();
  const rows = [
    [
      'id',
      'title',
      'description',
      'link',
      'image_link',
      'price',
      'availability',
      'condition',
      'brand',
      'product_type',
      'google_product_category',
    ].join(','),
  ];

  for (const item of getKatalog()) {
    if (!item.priceFrom || item.priceFrom <= 0) continue;
    const image = item.images?.[0];
    if (!image) continue;
    const imageUrl = image.startsWith('http') ? image : `${site.siteUrl}${image}`;
    const link = `${site.siteUrl}${catalogItemPath(item.category, item.slug)}`;
    rows.push(
      [
        csvCell(item.slug.toUpperCase()),
        csvCell(plain(item.title, 500)),
        csvCell(plain(item.description || item.tagline || item.title, 10000)),
        csvCell(link),
        csvCell(imageUrl),
        csvCell(`${item.priceFrom}.00 RUB`),
        'in stock',
        'new',
        csvCell('Real Besedki'),
        csvCell(PRODUCT_TYPE[item.category] || 'Беседки'),
        csvCell('Home & Garden > Lawn & Garden > Outdoor Living > Outdoor Structures > Gazebos'),
      ].join(','),
    );
  }

  return new Response(`${rows.join('\n')}\n`, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}

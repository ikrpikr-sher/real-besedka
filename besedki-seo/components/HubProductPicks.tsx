import Link from 'next/link';
import CatalogCard from '@/components/CatalogCard';
import JsonLd from '@/components/JsonLd';
import { getCatalogItemBySlug, getCatalogItemUrl, getSite } from '@/lib/content';

type HubProductPicksProps = {
  slugs: string[];
  heading?: string;
  catalogHref?: string;
  catalogLabel?: string;
};

export function catalogFromPrice(slug: string): string {
  const item = getCatalogItemBySlug(slug);
  if (!item) return 'в карточке';
  return `от ${item.priceFrom.toLocaleString('ru-RU')} ₽`;
}

export default function HubProductPicks({
  slugs,
  heading = 'Модели и цена с каталога',
  catalogHref = '/katalog',
  catalogLabel = 'Все модели',
}: HubProductPicksProps) {
  const site = getSite();
  const items = slugs
    .map((slug) => getCatalogItemBySlug(slug))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  if (items.length === 0) return null;

  const itemListLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${site.siteUrl}${getCatalogItemUrl(item)}`,
      name: item.title,
      item: {
        '@type': 'Product',
        name: item.title,
        url: `${site.siteUrl}${getCatalogItemUrl(item)}`,
        offers: {
          '@type': 'Offer',
          priceCurrency: 'RUB',
          price: item.priceFrom,
          availability: 'https://schema.org/InStock',
        },
      },
    })),
  };

  return (
    <section className="mb-10">
      <JsonLd data={itemListLd} />
      <h2 className="mb-2 font-heading text-2xl">{heading}</h2>
      <p className="mb-4 max-w-3xl text-sm text-text-muted">
        Цена «от» — с карточки модели. Фундамент, доставка и опции считаются в смете. Расчёт своей
        комплектации — в форме ниже.
      </p>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item, index) => (
          <CatalogCard key={item.slug} item={item} compact priority={index === 0} />
        ))}
      </div>
      <p className="mt-4 text-sm">
        <Link className="text-accent hover:underline" href={catalogHref}>
          {catalogLabel}
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="#raschet">
          Рассчитать свою
        </Link>
      </p>
    </section>
  );
}

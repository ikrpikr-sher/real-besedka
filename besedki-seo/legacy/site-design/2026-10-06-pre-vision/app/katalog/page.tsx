import type { Metadata } from 'next';
import NavLink from '@/components/NavLink';
import Container from '@/components/Container';
import CatalogCard from '@/components/CatalogCard';
import Breadcrumbs from '@/components/Breadcrumbs';
import JsonLd from '@/components/JsonLd';
import { CATALOG_CATEGORIES } from '@/lib/catalogCategories';
import { getKatalog, getKatalogByCategory, getSite } from '@/lib/content';
import { countKacheliListingCards } from '@/lib/kacheliCatalog';
import { getSeo } from '@/lib/seo';

export const revalidate = 300;

export function generateMetadata(): Metadata {
  const seo = getSeo('/katalog', {
    title: 'Каталог — беседки, мангал, навесы, качели, павильоны',
    description:
      'Каталог металлоконструкций от производителя: открытые и закрытые беседки, беседки с мангалом, навесы, качели, павильоны. Цены, фото, комплектация. Москва и МО.',
  });
  const site = getSite();
  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical: '/katalog' },
    openGraph: {
      type: 'website',
      locale: 'ru_RU',
      siteName: site.siteName,
      title: seo.title,
      description: seo.description,
      url: `${site.siteUrl}/katalog`,
    },
  };
}

export default function KatalogPage() {
  const site = getSite();
  const allItems = getKatalog().filter((item) => item.category !== 'kacheli');

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Каталог продукции',
    url: `${site.siteUrl}/katalog`,
  };
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Главная', item: site.siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Каталог', item: `${site.siteUrl}/katalog` },
    ],
  };

  return (
    <Container className="page-section">
      <JsonLd data={[ld, breadcrumbLd]} />
      <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Каталог', href: '/katalog' }]} />
      <h1 className="page-title mb-4">Каталог продукции</h1>
      <p className="mb-10 max-w-2xl text-text-muted">
        Собственное производство металлоконструкций в Москве: беседки, беседки с мангалом, навесы, качели и павильоны.
        Выберите категорию или смотрите все модели ниже.
      </p>

      <div className="mb-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CATALOG_CATEGORIES.map((cat) => {
          const items = getKatalogByCategory(cat.slug);
          const count =
            cat.slug === 'kacheli' ? countKacheliListingCards(items) : items.length;
          const countLabel =
            count > 0 ? `${count} моделей →` : 'Смотреть раздел →';
          return (
            <NavLink
              key={cat.slug}
              href={`/katalog/${cat.slug}`}
              className="card block transition-shadow hover:shadow-md"
            >
              <h2 className="font-heading text-xl">{cat.title}</h2>
              <p className="mt-2 text-sm text-text-muted line-clamp-3">{cat.description}</p>
              <p className="mt-3 text-sm font-medium text-accent">{countLabel}</p>
            </NavLink>
          );
        })}
      </div>

      {allItems.length > 0 && (
        <>
          <h2 className="mb-2 font-heading text-2xl">Популярные модели</h2>
          <p className="mb-6 max-w-2xl text-sm text-text-muted">
            Полный список — в разделах категорий выше. Так страница грузится быстрее на телефоне.
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {allItems.slice(0, 9).map((item, index) => (
              <CatalogCard key={item.slug} item={item} compact priority={index < 2} />
            ))}
          </div>
        </>
      )}
    </Container>
  );
}

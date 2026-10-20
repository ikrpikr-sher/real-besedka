import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Container from '@/components/Container';
import CatalogCard from '@/components/CatalogCard';
import KacheliPatternCard from '@/components/KacheliPatternCard';
import Breadcrumbs from '@/components/Breadcrumbs';
import JsonLd from '@/components/JsonLd';
import {
  getCatalogCategory,
  isCatalogCategory,
} from '@/lib/catalogCategories';
import { getKatalogByCategory, getSite } from '@/lib/content';
import { groupKacheliItems, isKacheliGraphiteItem, sortKacheliMoreItems } from '@/lib/kacheliCatalog';
import { groupBesedkiSMangalom, groupMangalyItems } from '@/lib/mangalCatalog';
import { getSeo } from '@/lib/seo';

type Props = { params: { category: string } };

export const revalidate = 300;

export function generateMetadata({ params }: Props): Metadata {
  const cat = getCatalogCategory(params.category);
  if (!cat) return {};
  const site = getSite();
  const seo = getSeo(`/katalog/${cat.slug}`, {
    title: `${cat.title} — каталог, цены и фото`,
    description: cat.description,
  });
  const path = `/katalog/${cat.slug}`;
  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      locale: 'ru_RU',
      siteName: site.siteName,
      title: seo.title,
      description: seo.description,
      url: `${site.siteUrl}${path}`,
    },
  };
}

export default function KatalogCategoryPage({ params }: Props) {
  if (!isCatalogCategory(params.category)) notFound();

  const cat = getCatalogCategory(params.category)!;
  const items = getKatalogByCategory(params.category);
  const site = getSite();
  const kacheliGraphite = params.category === 'kacheli' ? items.filter(isKacheliGraphiteItem) : [];
  const kacheliMore =
    params.category === 'kacheli'
      ? sortKacheliMoreItems(items.filter((item) => !isKacheliGraphiteItem(item)))
      : [];
  const kacheliGroups = params.category === 'kacheli' ? groupKacheliItems(kacheliGraphite) : [];

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: cat.title,
    url: `${site.siteUrl}/katalog/${cat.slug}`,
  };
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Главная', item: site.siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Каталог', item: `${site.siteUrl}/katalog` },
      { '@type': 'ListItem', position: 3, name: cat.title, item: `${site.siteUrl}/katalog/${cat.slug}` },
    ],
  };
  const itemListLd =
    items.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: cat.title,
          numberOfItems: items.length,
          itemListElement: items.slice(0, 20).map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.title,
            url: `${site.siteUrl}/katalog/${item.category}/${item.slug}`,
          })),
        }
      : null;

  return (
    <Container className="page-section">
      <JsonLd data={[ld, breadcrumbLd, ...(itemListLd ? [itemListLd] : [])]} />
      <Breadcrumbs
        items={[
          { label: 'Главная', href: '/' },
          { label: 'Каталог', href: '/katalog' },
          { label: cat.title, href: `/katalog/${cat.slug}` },
        ]}
      />
      <h1 className="page-title mb-4">{cat.title}</h1>

      {params.category === 'besedki-s-mangalom' ? (
        <>
          <p className="mb-6 max-w-2xl text-text-muted">
            Готовые беседки серии «Огонь»: лазерные панели, пол ДПК, встроенный мангал с дымоходом. Каркас
            80×80, металлочерепица — производство и монтаж под ключ в Москве и МО.
          </p>
          <div className="mb-10 rounded-DEFAULT border border-border bg-surface px-4 py-3 text-sm text-text-muted">
            Нужен только мангал или навес без панелей?{' '}
            <Link href="/katalog/mangaly" className="font-medium text-accent hover:underline">
              Мангалы и мангальные зоны →
            </Link>
          </div>
          {groupBesedkiSMangalom(items).map((group) => (
            <section key={group.id} className="mb-12">
              <h2 className="mb-1 font-heading text-2xl">{group.title}</h2>
              <p className="mb-6 max-w-2xl text-sm text-text-muted">{group.hint}</p>
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {group.items.map((item) => (
                  <CatalogCard key={item.slug} item={item} compact />
                ))}
              </div>
            </section>
          ))}
        </>
      ) : params.category === 'mangaly' ? (
        <>
          <p className="mb-6 max-w-2xl text-text-muted">
            Отдельные мангалы — или готовая зона под навесом серии «Огонь». Сталь 3–6 мм, порошок RAL 7016,
            производство под заказ в Москве и МО.
          </p>
          <div className="mb-10 rounded-DEFAULT border border-border bg-surface px-4 py-3 text-sm text-text-muted">
            Нужна полноценная беседка с панелями и мангалом?{' '}
            <Link href="/katalog/besedki-s-mangalom" className="font-medium text-accent hover:underline">
              Беседки с мангалом →
            </Link>
          </div>
          {groupMangalyItems(items).map((section) => (
            <section key={section.id} id={section.id} className="mb-12 scroll-mt-24">
              <h2 className="mb-1 font-heading text-2xl">{section.title}</h2>
              <p className="mb-6 max-w-2xl text-sm text-text-muted">{section.hint}</p>
              {section.groups ? (
                section.groups.map((group) => (
                  <div key={group.id} className="mb-10 last:mb-0">
                    <h3 className="mb-1 font-heading text-xl">{group.title}</h3>
                    <p className="mb-4 max-w-2xl text-sm text-text-muted">{group.hint}</p>
                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                      {group.items.map((item) => (
                        <CatalogCard key={item.slug} item={item} compact />
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {section.items.map((item) => (
                    <CatalogCard key={item.slug} item={item} compact />
                  ))}
                </div>
              )}
            </section>
          ))}
        </>
      ) : params.category === 'kacheli' ? (
        <>
          <p className="mb-8 max-w-2xl text-text-muted">
            Lyon, Malmo, решётка, поликарбонат и другие модели на каркасе 70×70×2 мм — ниже серия «Графит»
            K-01…K-24 с лазерными узорами на каркасе 80×80. Производство и монтаж в Москве и МО.
          </p>

          {kacheliMore.length > 0 ? (
            <section className="mb-14">
              <h2 className="mb-1 font-heading text-2xl">Новые модели</h2>
              <p className="mb-6 max-w-2xl text-sm text-text-muted">
                Каркас сталь 70×70×2 мм, графит RAL 7016. Цена «от» — точный расчёт по заявке.
              </p>
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {kacheliMore.map((item) => (
                  <CatalogCard key={item.slug} item={item} compact />
                ))}
              </div>
            </section>
          ) : null}

          {kacheliGroups.length > 0 ? (
            <section className="mb-14">
              <h2 className="mb-1 font-heading text-2xl">Серия «Графит»</h2>
              <p className="mb-6 max-w-2xl text-sm text-text-muted">
                Выберите рисунок на боковых панелях, затем размер. Металлочерепица, подушки в комплекте.
              </p>
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {kacheliGroups.map((group) => (
                  <KacheliPatternCard key={group.pattern} group={group} />
                ))}
              </div>
            </section>
          ) : null}

          {kacheliGroups.length === 0 && kacheliMore.length === 0 ? (
            <p className="text-text-muted">{cat.emptyText}</p>
          ) : null}
        </>
      ) : (
        <>
          <p className="mb-8 max-w-2xl text-text-muted">{cat.description}</p>

          {params.category === 'otkrytye-besedki' ? (
            <p className="mb-8 max-w-3xl text-sm text-text-muted">
              Сюжеты панелей:{' '}
              <Link className="text-accent hover:underline" href="/besedka-medvedi">
                Медведи
              </Link>
              {' · '}
              <Link className="text-accent hover:underline" href="/besedka-oleni">
                Олени
              </Link>
              {' · '}
              <Link className="text-accent hover:underline" href="/besedka-bogatyri">
                Богатыри
              </Link>
              {' · '}
              <Link className="text-accent hover:underline" href="/besedka-damask">
                Дамаск
              </Link>
              {' · '}
              <Link className="text-accent hover:underline" href="/besedka-losi">
                Лоси
              </Link>
              {' · '}
              <Link className="text-accent hover:underline" href="/besedka-rytsari">
                Рыцари
              </Link>
              {' · '}
              <Link className="text-accent hover:underline" href="/besedka-iz-metalla">
                из металла
              </Link>
            </p>
          ) : null}

          {items.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <CatalogCard key={item.slug} item={item} compact />
              ))}
            </div>
          ) : (
            <p className="text-text-muted">{cat.emptyText}</p>
          )}
        </>
      )}
    </Container>
  );
}

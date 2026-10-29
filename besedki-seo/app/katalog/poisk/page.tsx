import type { Metadata } from 'next';
import Link from 'next/link';
import Container from '@/components/Container';
import Breadcrumbs from '@/components/Breadcrumbs';
import CatalogCard from '@/components/CatalogCard';
import CatalogSearchForm from '@/components/CatalogSearchForm';
import { CATALOG_SEARCH_HINTS, searchCatalog } from '@/lib/catalogSearch';
import { getKatalog } from '@/lib/content';
import { getSeo } from '@/lib/seo';

export const revalidate = 300;

type Props = {
  searchParams?: { q?: string };
};

export function generateMetadata({ searchParams }: Props): Metadata {
  const query = searchParams?.q?.trim() ?? '';
  const seo = getSeo('/katalog/poisk', {
    title: query ? `Поиск «${query}» — каталог беседок` : 'Поиск по каталогу — беседки, навесы, качели',
    description: query
      ? `Результаты поиска «${query}» в каталоге металлоконструкций: беседки, навесы, качели, мангалы.`
      : 'Найдите нужную модель по названию, артикулу (В-53 или B-53), размеру или серии — Loft, Панорама, Графит.',
  });

  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical: '/katalog/poisk' },
    robots: { index: false, follow: true },
  };
}

export default function KatalogPoiskPage({ searchParams }: Props) {
  const query = searchParams?.q?.trim() ?? '';
  const items = getKatalog();
  const results = query ? searchCatalog(items, query) : [];

  return (
    <Container className="page-section">
      <Breadcrumbs
        items={[
          { label: 'Главная', href: '/' },
          { label: 'Каталог', href: '/katalog' },
          { label: 'Поиск', href: '/katalog/poisk' },
        ]}
      />

      <h1 className="page-title mb-4">Поиск по каталогу</h1>
      <p className="mb-6 max-w-2xl text-text-muted">
        Введите название модели, артикул (например В-53 или B-53), размер (3×4) или серию — Loft, Панорама, Графит.
      </p>

      <div className="mb-8 max-w-2xl">
        <CatalogSearchForm defaultQuery={query} autoFocus={!query} />
      </div>

      {!query ? (
        <div className="max-w-2xl">
          <p className="mb-3 text-sm font-medium text-text">Популярные запросы</p>
          <div className="flex flex-wrap gap-2">
            {CATALOG_SEARCH_HINTS.map((hint) => (
              <Link
                key={hint}
                href={`/katalog/poisk?q=${encodeURIComponent(hint)}`}
                className="rounded-full border border-border bg-surface px-3 py-2 text-sm text-text hover:border-accent/40 hover:text-accent"
              >
                {hint}
              </Link>
            ))}
          </div>
        </div>
      ) : results.length > 0 ? (
        <>
          <p className="mb-6 text-sm text-text-muted">
            Найдено: {results.length} {results.length === 1 ? 'модель' : results.length < 5 ? 'модели' : 'моделей'}
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {results.map(({ item }) => (
              <CatalogCard key={`${item.category}-${item.slug}`} item={item} compact />
            ))}
          </div>
        </>
      ) : (
        <div className="max-w-2xl rounded-DEFAULT border border-border bg-surface p-6">
          <p className="font-medium text-text">По запросу «{query}» ничего не найдено</p>
          <p className="mt-2 text-sm text-text-muted">
            Попробуйте артикул (B-53), размер (3×4) или{' '}
            <Link href="/katalog" className="text-accent hover:underline">
              посмотрите весь каталог
            </Link>
            .
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {CATALOG_SEARCH_HINTS.slice(0, 4).map((hint) => (
              <Link
                key={hint}
                href={`/katalog/poisk?q=${encodeURIComponent(hint)}`}
                className="rounded-full border border-border px-3 py-1.5 text-sm text-text hover:border-accent/40"
              >
                {hint}
              </Link>
            ))}
          </div>
        </div>
      )}
    </Container>
  );
}

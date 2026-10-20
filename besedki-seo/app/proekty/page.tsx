import type { Metadata } from 'next';
import Link from 'next/link';
import Container from '@/components/Container';
import Breadcrumbs from '@/components/Breadcrumbs';
import JsonLd from '@/components/JsonLd';
import { getSeo } from '@/lib/seo';
import { getCatalogItemUrl, getKatalog, getSite } from '@/lib/content';
import { withImageCacheBust } from '@/lib/catalogImages';

const PATH = '/proekty';
const MIN_PHOTOS = 6;

export function generateMetadata(): Metadata {
  const seo = getSeo(PATH, {
    title: 'Портфолио беседок — фото моделей | Реал Беседки',
    description:
      'Фоторяд моделей металлических беседок: от 6 кадров на карточку. Каталог ООО «Пулман», каркас 80×80, Москва и МО.',
  });
  return {
    title: { absolute: seo.title },
    description: seo.description,
    alternates: { canonical: PATH },
  };
}

export default function ProektyPage() {
  const site = getSite();
  const items = getKatalog()
    .filter((item) => (item.images?.length || 0) >= MIN_PHOTOS)
    .slice(0, 36);
  const pageLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Портфолио моделей Реал Беседки',
    url: `${site.siteUrl}${PATH}`,
    description: 'Модели с полным фоторядом (от 6 кадров). Не подмена клиентских объектов.',
  };

  return (
    <Container className="page-section">
      <JsonLd data={pageLd} />
      <Breadcrumbs
        items={[
          { label: 'Главная', href: '/' },
          { label: 'Портфолио', href: PATH },
        ]}
      />
      <h1 className="page-title mb-4">Портфолио моделей</h1>
      <p className="mb-6 max-w-3xl text-text-muted">
        Здесь модели с полным дворовым фоторядом (от {MIN_PHOTOS} кадров). Это витрина каталога, не
        подборка чужих объектов. Клиентские отзывы — на{' '}
        <Link className="text-accent hover:underline" href="/otzyvy">
          странице отзывов
        </Link>
        .
      </p>
      {items.length === 0 ? (
        <p className="text-text-muted">
          Пока мало карточек с полным рядом — смотрите{' '}
          <Link className="text-accent hover:underline" href="/katalog">
            каталог
          </Link>
          .
        </p>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const href = getCatalogItemUrl(item);
            const cover = withImageCacheBust(item.images[0]);
            return (
              <article key={item.slug} className="group">
                <Link href={href} className="block overflow-hidden rounded-lg bg-surface">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cover}
                    alt={`${item.title}, ${item.size}`}
                    className="aspect-[4/3] w-full object-cover transition group-hover:scale-[1.02]"
                    width={800}
                    height={600}
                  />
                </Link>
                <h2 className="mt-3 font-heading text-lg">
                  <Link href={href} className="hover:text-accent">
                    {item.title}
                  </Link>
                </h2>
                <p className="text-sm text-text-muted">
                  {item.size} · от {item.priceFrom.toLocaleString('ru-RU')} ₽ · {item.images.length}{' '}
                  фото
                </p>
              </article>
            );
          })}
        </div>
      )}
      <p className="mt-10 text-sm text-text-muted">
        <Link className="text-accent hover:underline" href="/katalog">
          Весь каталог
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/konfigurator">
          Калькулятор
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/regiony">
          Города МО
        </Link>
      </p>
    </Container>
  );
}

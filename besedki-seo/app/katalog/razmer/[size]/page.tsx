import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Container from '@/components/Container';
import CatalogCard from '@/components/CatalogCard';
import Breadcrumbs from '@/components/Breadcrumbs';
import JsonLd from '@/components/JsonLd';
import { getSizeHub, getSizeHubs } from '@/lib/catalogSizes';
import { getCatalogItemUrl, getSite } from '@/lib/content';

type Props = { params: { size: string } };

function spokenSize(slug: string): string {
  const [a, b] = slug.split('x');
  return a && b ? `${a} на ${b}` : slug.replace('x', '×');
}

export const dynamic = 'force-dynamic';

export function generateStaticParams() {
  return getSizeHubs().map((hub) => ({ size: hub.slug }));
}

const SIZE_SEO_LANDING: Record<string, string> = {
  '2x2': '/besedka-2x2',
  '2x3': '/besedka-2x3',
  '2.5x2.5': '/besedka-2-5x2-5',
  '3x3': '/besedka-3x3',
  '3x4': '/besedka-3x4',
  '4x3': '/besedka-4x3',
  '4x4': '/besedka-4x4',
  '5x4': '/besedka-5x4',
  '5x5': '/besedka-5x5',
  '6x3': '/besedka-6x3',
  '6x4': '/besedka-6x4',
  '6x5': '/besedka-6x5',
  '6x6': '/besedka-6x6',
  '8x6': '/besedka-8x6',
};

export function generateMetadata({ params }: Props): Metadata {
  const hub = getSizeHub(params.size);
  if (!hub) return {};
  const from = Math.min(...hub.items.map((item) => item.priceFrom));
  const spoken = spokenSize(hub.slug);
  const title = `Беседка ${hub.label} металлическая — купить в Москве`;
  const description = `Беседка ${spoken} из металла (${hub.label} м): каркас 80×80×3 мм, открытые и с остеклением, пол фанера в базе, панели 3 мм. От ${from.toLocaleString('ru-RU')} ₽. Расчёт и монтаж в Москве и МО.`;
  const landing = SIZE_SEO_LANDING[hub.slug];
  const isThin = hub.items.length < 2;
  const thinCanonical = isThin ? getCatalogItemUrl(hub.items[0]) : null;
  const canonical = landing ?? thinCanonical ?? `/katalog/razmer/${hub.slug}`;
  const noindex = Boolean(landing) || isThin;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      locale: 'ru_RU',
      type: 'website',
      images: [{ url: '/images/hero-besedka.webp', width: 1200, height: 630 }],
    },
    // Посадочные /besedka-* и хабы с 1 товаром не конкурируют в индексе
    robots: noindex ? { index: false, follow: true } : { index: true, follow: true },
  };
}

export default function SizeHubPage({ params }: Props) {
  const hub = getSizeHub(params.size);
  if (!hub) notFound();

  const site = getSite();
  const from = Math.min(...hub.items.map((item) => item.priceFrom));
  const open = hub.items.filter((item) => item.category === 'otkrytye-besedki');
  const glazed = hub.items.filter((item) => item.category === 'besedki-s-ostekleniem');
  const hitOpen = [...open].sort((a, b) => a.priceFrom - b.priceFrom)[0];
  const hitGlazed = [...glazed].sort((a, b) => a.priceFrom - b.priceFrom)[0];

  const landing = SIZE_SEO_LANDING[hub.slug];
  const isThin = hub.items.length < 2;
  const pageUrl =
    landing ??
    (isThin ? getCatalogItemUrl(hub.items[0]) : `/katalog/razmer/${hub.slug}`);
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Металлическая беседка ${hub.label}`,
    url: pageUrl.startsWith('http') ? pageUrl : `${site.siteUrl}${pageUrl}`,
    description: `Каталог металлических беседок ${hub.label} м от производителя.`,
  };

  return (
    <Container className="page-section">
      <JsonLd data={ld} />
      <Breadcrumbs
        items={[
          { label: 'Главная', href: '/' },
          { label: 'Каталог', href: '/katalog' },
          { label: `Беседка ${hub.label}`, href: `/katalog/razmer/${hub.slug}` },
        ]}
      />
      <h1 className="page-title mb-4">Металлическая беседка {hub.label} м</h1>
      <p className="mb-6 max-w-2xl text-text-muted">
        Беседка {spokenSize(hub.slug)} из металла ({hub.label} м) в каталоге ООО «Пулман»: открытые модели и с остеклением.
        Каркас 80×80×3 мм на болтах, кровля металлочерепица, пол фанера в базе (ДПК — опция), резные панели из стали 3 мм, порошковая краска.
        Монтаж в Москве и МО. Цены от {from.toLocaleString('ru-RU')} ₽ — точную смету считаем по участку.
      </p>
      {hitOpen || hitGlazed ? (
        <p className="mb-6 max-w-2xl text-text-muted">
          Купить беседку {spokenSize(hub.slug)}:
          {hitOpen ? (
            <>
              {' '}
              открытая{' '}
              <Link className="text-accent hover:underline" href={getCatalogItemUrl(hitOpen)}>
                {hitOpen.title}
              </Link>
              {' от '}
              {hitOpen.priceFrom.toLocaleString('ru-RU')} ₽
            </>
          ) : null}
          {hitOpen && hitGlazed ? ', ' : null}
          {hitGlazed ? (
            <>
              с остеклением{' '}
              <Link className="text-accent hover:underline" href={getCatalogItemUrl(hitGlazed)}>
                {hitGlazed.title}
              </Link>
              {' от '}
              {hitGlazed.priceFrom.toLocaleString('ru-RU')} ₽
            </>
          ) : null}
          .
        </p>
      ) : null}
      <p className="mb-8 text-sm">
        <Link className="text-accent hover:underline" href="/katalog/otkrytye-besedki">
          Открытые беседки
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/katalog/besedki-s-ostekleniem">
          С остеклением
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/kontakty">
          Рассчитать {hub.label}
        </Link>
      </p>

      {open.length > 0 ? (
        <>
          <h2 className="mb-4 font-heading text-2xl">Открытые {hub.label}</h2>
          <div className="mb-10 grid gap-6 md:grid-cols-3">
            {open.map((item) => (
              <CatalogCard key={item.slug} item={item} />
            ))}
          </div>
        </>
      ) : null}

      {glazed.length > 0 ? (
        <>
          <h2 className="mb-4 font-heading text-2xl">С остеклением {hub.label}</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {glazed.map((item) => (
              <CatalogCard key={item.slug} item={item} />
            ))}
          </div>
        </>
      ) : null}
    </Container>
  );
}

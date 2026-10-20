import type { Metadata } from 'next';
import Link from 'next/link';
import Container from '@/components/Container';
import Breadcrumbs from '@/components/Breadcrumbs';
import FAQ from '@/components/FAQ';
import JsonLd from '@/components/JsonLd';
import LeadForm from '@/components/LeadForm';
import { getSeo } from '@/lib/seo';
import { getSite } from '@/lib/content';

const PATH = '/besedka-medvedi';

const FAQ_ITEMS = [
  {
    question: 'Это отдельная конструкция?',
    answer:
      'Да, отдельный SKU с уникальным раскроем панелей.',
  },
  {
    question: 'Можно другой сюжет на этот размер?',
    answer:
      'Да, обсуждаем в заказе; база размеров — в размерных хабах.',
  }
];

export function generateMetadata(): Metadata {
  const seo = getSeo(PATH, {
    title: 'Беседка «Медведи» — от 240 000 ₽ | Реал Беседки',
    description: 'Беседка «Медведи» (B-12): металлическая беседка 3×3, панели ЧПУ. От 240 000 ₽. Москва и МО.',
  });
  return {
    title: { absolute: seo.title },
    description: seo.description,
    alternates: { canonical: PATH },
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: PATH,
      locale: 'ru_RU',
      type: 'website',
      images: [{ url: '/images/hero-besedka.webp', width: 1200, height: 800 }],
    },
  };
}

export default function HubPage() {
  const site = getSite();
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
  const pageLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Беседка «Медведи»',
    url: `${site.siteUrl}${PATH}`,
    description: 'Беседка «Медведи» (B-12): металлическая беседка 3×3, панели ЧПУ. От 240 000 ₽. Москва и МО.',
  };

  return (
    <Container className="page-section">
      <JsonLd data={[pageLd, faqLd]} />
      <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Беседка Медведи', href: PATH }]} />
      <p className="text-sm font-medium text-accent">Сюжет панелей ЧПУ — наш моат против дерева</p>
      <h1 className="page-title mb-4">Беседка «Медведи»</h1>
      <p className="mb-4 max-w-3xl text-text-muted">
        Медведи — сюжет панелей ЧПУ на открытой 3×3. Не путать с «просто 3 на 3» без узора.
      </p>
      <p className="mb-8 max-w-3xl text-text-muted">
        Каркас 80×80×3 мм, порошок, монтаж в Москве и МО. Карточка модели — в каталоге.
      </p>

      <h2 className="mb-3 font-heading text-2xl">Модель</h2>
      <p className="mb-8 max-w-3xl text-text-muted">
        <Link className="text-accent hover:underline" href="/katalog/otkrytye-besedki/b-12">B-12</Link> — 3×3, от 240 000 ₽. Смотрите также размерный хаб и соседние сюжеты в каталоге открытых.
      </p>

      <h2 className="mb-3 font-heading text-2xl">Соседние сюжеты</h2>
      <p className="mb-8 max-w-3xl text-text-muted">
        <Link className="text-accent hover:underline" href="/besedka-medvedi">Медведи</Link> · <Link className="text-accent hover:underline" href="/besedka-oleni">Олени</Link> · <Link className="text-accent hover:underline" href="/besedka-bogatyri">Богатыри</Link> · <Link className="text-accent hover:underline" href="/besedka-damask">Дамаск</Link> · <Link className="text-accent hover:underline" href="/besedka-losi">Лоси</Link> · <Link className="text-accent hover:underline" href="/besedka-rytsari">Рыцари</Link>
      </p>

      <p className="mb-8 text-sm">
        <Link className="text-accent hover:underline" href="/katalog/otkrytye-besedki/b-12">
          B-12
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/katalog/otkrytye-besedki">
          Открытые
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/tseny-na-besedki">
          Цены
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/kontakty">
          Заявка
        </Link>
      </p>

      <FAQ items={FAQ_ITEMS} />
      <div className="mt-10">
        <h2 className="mb-3 font-heading text-2xl">Оставить заявку</h2>
        <LeadForm context="besedka-medvedi" />
      </div>
    </Container>
  );
}

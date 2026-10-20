import type { Metadata } from 'next';
import Link from 'next/link';
import Container from '@/components/Container';
import Breadcrumbs from '@/components/Breadcrumbs';
import FAQ from '@/components/FAQ';
import JsonLd from '@/components/JsonLd';
import LeadForm from '@/components/LeadForm';
import { getSeo } from '@/lib/seo';
import { getSite } from '@/lib/content';

const PATH = '/kacheli';

const FAQ_ITEMS = [
  {
    question: 'Сколько стоят качели?',
    answer:
      'От 140 000 ₽ за модели серии «Графит».',
  },
  {
    question: 'Это те же, что в каталоге?',
    answer:
      'Да. Эта страница — вход по запросу «качели», ассортимент в /katalog/kacheli.',
  }
];

export function generateMetadata(): Metadata {
  const seo = getSeo(PATH, {
    title: 'Качели из металла — от 140 000 ₽ | Реал Беседки',
    description: 'Металлические садовые качели Реал Беседки: каркас 80×80, порошковая краска. От 140 000 ₽. Каталог и цены. Москва и МО.',
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
    name: 'Качели из металла',
    url: `${site.siteUrl}${PATH}`,
    description: 'Металлические садовые качели Реал Беседки: каркас 80×80, порошковая краска. От 140 000 ₽. Каталог и цены. Москва и МО.',
  };

  return (
    <Container className="page-section">
      <JsonLd data={[pageLd, faqLd]} />
      <Breadcrumbs
        items={[
          { label: 'Главная', href: '/' },
          { label: 'Качели', href: PATH },
        ]}
      />
      <p className="text-sm font-medium text-accent">Заводской каркас, не ткань из ТЦ</p>
      <h1 className="page-title mb-4">Качели из металла</h1>
      <p className="mb-4 max-w-3xl text-text-muted">
        Металлические качели собственного производства: от 140 000 ₽. Полный каталог — в разделе качелей. Коммерческий разбор линейки — на странице садовых качелей.
      </p>
      <p className="mb-8 max-w-3xl text-text-muted">
        Доставка и установка по Москве и МО.
      </p>

      <h2 className="mb-3 font-heading text-2xl">Куда смотреть</h2>
      <ul className="mb-8 max-w-3xl list-disc space-y-2 pl-5 text-text-muted">
        <li><Link className="text-accent hover:underline" href="/katalog/kacheli">Каталог качелей</Link> — все модели и цены.</li>
        <li><Link className="text-accent hover:underline" href="/sadovye-kacheli">Садовые качели</Link> — сравнение и FAQ.</li>
        <li><Link className="text-accent hover:underline" href="/otkrytaya-besedka">Открытые беседки</Link> — если нужен комплект на участок.</li>
      </ul>

      <p className="mb-8 text-sm">
        <Link className="text-accent hover:underline" href="/katalog/kacheli">
          Каталог
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/sadovye-kacheli">
          Садовые качели
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/kontakty">
          Заявка
        </Link>
      </p>

      <FAQ items={FAQ_ITEMS} />
      <div className="mt-10">
        <h2 className="mb-3 font-heading text-2xl">Оставить заявку</h2>
        <LeadForm context="kacheli" />
      </div>
    </Container>
  );
}

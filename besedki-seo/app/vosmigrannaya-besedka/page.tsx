import type { Metadata } from 'next';
import Link from 'next/link';
import Container from '@/components/Container';
import Breadcrumbs from '@/components/Breadcrumbs';
import FAQ from '@/components/FAQ';
import JsonLd from '@/components/JsonLd';
import LeadForm from '@/components/LeadForm';
import { getSeo } from '@/lib/seo';
import { getSite } from '@/lib/content';

const PATH = '/vosmigrannaya-besedka';

const FAQ_ITEMS = [
  {
    question: 'Для чего Ø8–10?',
    answer:
      'Центр большого участка, приёмы, акцент в ландшафте.',
  },
  {
    question: 'Есть ли лофт восьмигранник?',
    answer:
      'Лофт C8 — прямоугольные. Многогранники — открытая серия «Графит».',
  }
];

export function generateMetadata(): Metadata {
  const seo = getSeo(PATH, {
    title: 'Восьмигранная беседка из металла — от 520 000 ₽ | Реал Беседки',
    description: 'Восьмигранные металлические беседки: Ø8 м от 520 000 ₽, Ø10 м от 680 000 ₽. Каркас 80×80. Москва и МО.',
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
    name: 'Восьмигранная беседка из металла',
    url: `${site.siteUrl}${PATH}`,
    description: 'Восьмигранные металлические беседки: Ø8 м от 520 000 ₽, Ø10 м от 680 000 ₽. Каркас 80×80. Москва и МО.',
  };

  return (
    <Container className="page-section">
      <JsonLd data={[pageLd, faqLd]} />
      <Breadcrumbs
        items={[
          { label: 'Главная', href: '/' },
          { label: 'Восьмигранная беседка', href: PATH },
        ]}
      />
      <p className="text-sm font-medium text-accent">Крупный многогранник под мероприятия</p>
      <h1 className="page-title mb-4">Восьмигранная беседка из металла</h1>
      <p className="mb-4 max-w-3xl text-text-muted">
        Восьмигранник — крупные открытые модели: B-57 Ø8 м от 520 000 ₽, B-59 Ø10 м от 680 000 ₽. Это не дачная 2×2, а конструкция под участок и основание по расчёту.
      </p>
      <p className="mb-8 max-w-3xl text-text-muted">
        Меньше по диаметру — шестигранники Ø2,5–6.
      </p>

      <h2 className="mb-3 font-heading text-2xl">Модели</h2>
      <div className="mb-8 overflow-x-auto">
        <table className="w-full min-w-[32rem] text-left text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="py-2 pr-3">Модель</th>
              <th className="py-2 pr-3">Диаметр</th>
              <th className="py-2">Цена от</th>
            </tr>
          </thead>
          <tbody className="text-text-muted">
            <tr className="border-b border-border">
              <td className="py-2 pr-3"><Link className="text-accent hover:underline" href="/katalog/otkrytye-besedki/b-57">B-57</Link></td>
              <td className="py-2 pr-3">Ø8 м</td>
              <td className="py-2">520 000 ₽</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-3"><Link className="text-accent hover:underline" href="/katalog/otkrytye-besedki/b-59">B-59</Link></td>
              <td className="py-2 pr-3">Ø10 м</td>
              <td className="py-2">680 000 ₽</td>
            </tr>
            <tr className="">
              <td className="py-2 pr-3"><Link className="text-accent hover:underline" href="/katalog/otkrytye-besedki/b-56">B-56 шестигранник</Link></td>
              <td className="py-2 pr-3">Ø6 м</td>
              <td className="py-2">400 000 ₽</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="mb-3 font-heading text-2xl">Основание</h2>
      <p className="mb-8 max-w-3xl text-text-muted">
        Обязателен проект свай/плиты. Монтаж и доставка — по смете, не «как у 3×4».
      </p>

      <p className="mb-8 text-sm">
        <Link className="text-accent hover:underline" href="/katalog/otkrytye-besedki/b-57">
          B-57
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/shestigrannaya-besedka">
          Шестигранные
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/besedka-6x6">
          6×6
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/tseny-na-besedki">
          Цены
        </Link>
      </p>

      <FAQ items={FAQ_ITEMS} />
      <div className="mt-10">
        <h2 className="mb-3 font-heading text-2xl">Оставить заявку</h2>
        <LeadForm context="vosmigrannaya-besedka" />
      </div>
    </Container>
  );
}

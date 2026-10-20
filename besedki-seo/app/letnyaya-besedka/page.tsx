import type { Metadata } from 'next';
import Link from 'next/link';
import Container from '@/components/Container';
import Breadcrumbs from '@/components/Breadcrumbs';
import FAQ from '@/components/FAQ';
import JsonLd from '@/components/JsonLd';
import LeadForm from '@/components/LeadForm';
import { getSeo } from '@/lib/seo';
import { getSite } from '@/lib/content';

const PATH = '/letnyaya-besedka';

const FAQ_ITEMS = [
  {
    question: 'Летняя = открытая?',
    answer:
      'Да, в нашем каталоге.',
  },
  {
    question: 'Шторы спасут зиму?',
    answer:
      'Нет. Для зимы — стеклопакет.',
  }
];

export function generateMetadata(): Metadata {
  const seo = getSeo(PATH, {
    title: 'Летняя беседка из металла — от 95 000 ₽ | Реал Беседки',
    description: 'Летняя металлическая беседка: открытый контур от 95 000 ₽, шторы и сетки опцией. Каркас 80×80. Москва и МО.',
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
    name: 'Летняя беседка из металла',
    url: `${site.siteUrl}${PATH}`,
    description: 'Летняя металлическая беседка: открытый контур от 95 000 ₽, шторы и сетки опцией. Каркас 80×80. Москва и МО.',
  };

  return (
    <Container className="page-section">
      <JsonLd data={[pageLd, faqLd]} />
      <Breadcrumbs
        items={[
          { label: 'Главная', href: '/' },
          { label: 'Летняя беседка', href: PATH },
        ]}
      />
      <p className="text-sm font-medium text-accent">Сезон на воздухе без стекла</p>
      <h1 className="page-title mb-4">Летняя беседка из металла</h1>
      <p className="mb-4 max-w-3xl text-text-muted">
        Летняя беседка — открытый каркас с кровлей: тень, дождь сверху, воздух сбоку. У нас это открытая серия от 95 000 ₽. Шторы и москитные сетки — опции, не «зимний» контур.
      </p>
      <p className="mb-8 max-w-3xl text-text-muted">
        Если нужны осень и зима — сразу зимняя / закрытая со стеклопакетом.
      </p>

      <h2 className="mb-3 font-heading text-2xl">Летняя vs зимняя</h2>
      <div className="mb-8 overflow-x-auto">
        <table className="w-full min-w-[32rem] text-left text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="py-2 pr-3"></th>
              <th className="py-2 pr-3">Летняя (открытая)</th>
              <th className="py-2">Зимняя</th>
            </tr>
          </thead>
          <tbody className="text-text-muted">
            <tr className="border-b border-border">
              <td className="py-2 pr-3">Цена от</td>
              <td className="py-2 pr-3">95 000 ₽</td>
              <td className="py-2">400 000 ₽</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-3">Стены</td>
              <td className="py-2 pr-3">панели / проём</td>
              <td className="py-2">стеклопакет</td>
            </tr>
            <tr className="">
              <td className="py-2 pr-3">Сезон</td>
              <td className="py-2 pr-3">май–октябрь</td>
              <td className="py-2">круглый год</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="mb-3 font-heading text-2xl">Хиты лета</h2>
      <p className="mb-8 max-w-3xl text-text-muted">
        <Link className="text-accent hover:underline" href="/besedka-3x4">3×4</Link> и <Link className="text-accent hover:underline" href="/besedka-4x4">4×4</Link> — самые частые посадки под стол.
      </p>

      <p className="mb-8 text-sm">
        <Link className="text-accent hover:underline" href="/otkrytaya-besedka">
          Открытые
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/zimnyaya-besedka">
          Зимние
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/zakrytaya-besedka">
          Закрытые
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/tseny-na-besedki">
          Цены
        </Link>
      </p>

      <FAQ items={FAQ_ITEMS} />
      <div className="mt-10">
        <h2 className="mb-3 font-heading text-2xl">Оставить заявку</h2>
        <LeadForm context="letnyaya-besedka" />
      </div>
    </Container>
  );
}

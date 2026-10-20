import type { Metadata } from 'next';
import Link from 'next/link';
import Container from '@/components/Container';
import Breadcrumbs from '@/components/Breadcrumbs';
import FAQ from '@/components/FAQ';
import JsonLd from '@/components/JsonLd';
import LeadForm from '@/components/LeadForm';
import { getSeo } from '@/lib/seo';
import { getSite } from '@/lib/content';

const PATH = '/sadovye-kacheli';

const FAQ_ITEMS = [
  {
    question: 'Есть ли доставка?',
    answer:
      'Да, Москва и МО — вместе с беседкой или отдельно.',
  },
  {
    question: 'Качели с крышей?',
    answer:
      'Смотрите карточки каталога: конфигурации отличаются.',
  }
];

export function generateMetadata(): Metadata {
  const seo = getSeo(PATH, {
    title: 'Садовые качели из металла — от 140 000 ₽ | Реал Беседки',
    description: 'Садовые металлические качели «Графит»: каркас 80×80, лазерные панели. От 140 000 ₽. Москва и МО.',
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
    name: 'Садовые качели из металла',
    url: `${site.siteUrl}${PATH}`,
    description: 'Садовые металлические качели «Графит»: каркас 80×80, лазерные панели. От 140 000 ₽. Москва и МО.',
  };

  return (
    <Container className="page-section">
      <JsonLd data={[pageLd, faqLd]} />
      <Breadcrumbs
        items={[
          { label: 'Главная', href: '/' },
          { label: 'Садовые качели', href: PATH },
        ]}
      />
      <p className="text-sm font-medium text-accent">Тот же заводской металл, что у беседок</p>
      <h1 className="page-title mb-4">Садовые качели из металла</h1>
      <p className="mb-4 max-w-3xl text-text-muted">
        Садовые качели Реал Беседки — серия «Графит» и другие модели каталога: каркас 80×80, порошок, лазерные панели. От 140 000 ₽ за K-01 «Богатыри».
      </p>
      <p className="mb-8 max-w-3xl text-text-muted">
        Не путать с тканевыми качелями из гипермаркета: другой ресурс и другая жёсткость.
      </p>

      <h2 className="mb-3 font-heading text-2xl">Старт линейки</h2>
      <div className="mb-8 overflow-x-auto">
        <table className="w-full min-w-[32rem] text-left text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="py-2 pr-3">Модель</th>
              <th className="py-2 pr-3">Серия</th>
              <th className="py-2">Цена от</th>
            </tr>
          </thead>
          <tbody className="text-text-muted">
            <tr className="border-b border-border">
              <td className="py-2 pr-3"><Link className="text-accent hover:underline" href="/katalog/kacheli/k-01">K-01 Богатыри</Link></td>
              <td className="py-2 pr-3">Графит</td>
              <td className="py-2">140 000 ₽</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-3"><Link className="text-accent hover:underline" href="/katalog/kacheli/k-03">K-03 Медведи</Link></td>
              <td className="py-2 pr-3">Графит</td>
              <td className="py-2">140 000 ₽</td>
            </tr>
            <tr className="">
              <td className="py-2 pr-3"><Link className="text-accent hover:underline" href="/katalog/kacheli">Весь каталог</Link></td>
              <td className="py-2 pr-3">36 моделей</td>
              <td className="py-2">от 140 000 ₽</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="mb-3 font-heading text-2xl">С беседкой</h2>
      <p className="mb-8 max-w-3xl text-text-muted">
        Часто ставят рядом с открытой беседкой. Комплект считаем в одной смете доставки.
      </p>

      <p className="mb-8 text-sm">
        <Link className="text-accent hover:underline" href="/katalog/kacheli">
          Каталог качелей
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/otkrytaya-besedka">
          Беседки
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/dostavka-i-montazh">
          Доставка
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/kontakty">
          Заявка
        </Link>
      </p>

      <FAQ items={FAQ_ITEMS} />
      <div className="mt-10">
        <h2 className="mb-3 font-heading text-2xl">Оставить заявку</h2>
        <LeadForm context="sadovye-kacheli" />
      </div>
    </Container>
  );
}

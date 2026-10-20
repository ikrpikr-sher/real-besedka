import type { Metadata } from 'next';
import Link from 'next/link';
import Container from '@/components/Container';
import Breadcrumbs from '@/components/Breadcrumbs';
import FAQ from '@/components/FAQ';
import JsonLd from '@/components/JsonLd';
import LeadForm from '@/components/LeadForm';
import { getSeo } from '@/lib/seo';
import { getSite } from '@/lib/content';

const PATH = '/metallicheskiy-pavilon';

const FAQ_ITEMS = [
  {
    question: 'Павильон для дачи?',
    answer:
      'Обычно нет: берите открытую или остеклённую беседку.',
  },
  {
    question: 'Монтаж по России?',
    answer:
      'База — Москва и МО. Другие регионы — по запросу.',
  }
];

export function generateMetadata(): Metadata {
  const seo = getSeo(PATH, {
    title: 'Металлический павильон — от 150 000 ₽ | Реал Беседки',
    description: 'Металлические павильоны «Форум»: киоск от 150 000 ₽, торговые и event от 375 000 ₽, остеклённый 8×6 от 1 250 000 ₽. Москва и МО.',
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
      images: [{ url: '/images/pavilony/p-01/02-hero.jpg', width: 1200, height: 800 }],
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
    name: 'Металлический павильон',
    url: `${site.siteUrl}${PATH}`,
    description: 'Металлические павильоны «Форум»: киоск от 150 000 ₽, торговые и event от 375 000 ₽, остеклённый 8×6 от 1 250 000 ₽. Москва и МО.',
  };

  return (
    <Container className="page-section">
      <JsonLd data={[pageLd, faqLd]} />
      <Breadcrumbs
        items={[
          { label: 'Главная', href: '/' },
          { label: 'Металлический павильон', href: PATH },
        ]}
      />
      <p className="text-sm font-medium text-accent">Торговля и event, не дачная беседка</p>
      <h1 className="page-title mb-4">Металлический павильон</h1>
      <p className="mb-4 max-w-3xl text-text-muted">
        Павильон — отдельная линейка «Форум»: киоски, торговые и event-объёмы. От 150 000 ₽ за «Киоск 6». Это не садовая беседка 3×4.
      </p>
      <p className="mb-8 max-w-3xl text-text-muted">
        Для участка и гостей — беседки. Для ярмарки/точки — павильон.
      </p>

      <h2 className="mb-3 font-heading text-2xl">Модели</h2>
      <div className="mb-8 overflow-x-auto">
        <table className="w-full min-w-[32rem] text-left text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="py-2 pr-3">Модель</th>
              <th className="py-2 pr-3">Назначение</th>
              <th className="py-2">Цена от</th>
            </tr>
          </thead>
          <tbody className="text-text-muted">
            <tr className="border-b border-border">
              <td className="py-2 pr-3"><Link className="text-accent hover:underline" href="/katalog/pavilony/p-01">P-01 Киоск 6</Link></td>
              <td className="py-2 pr-3">киоск 3×2</td>
              <td className="py-2">150 000 ₽</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-3"><Link className="text-accent hover:underline" href="/katalog/pavilony/p-02">P-02 Киоск 10</Link></td>
              <td className="py-2 pr-3">киоск 4×2,5</td>
              <td className="py-2">250 000 ₽</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-3"><Link className="text-accent hover:underline" href="/katalog/pavilony/p-03">P-03 Торговый 15</Link></td>
              <td className="py-2 pr-3">торговля</td>
              <td className="py-2">375 000 ₽</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-3"><Link className="text-accent hover:underline" href="/katalog/pavilony/p-06">P-06 Event 24</Link></td>
              <td className="py-2 pr-3">мероприятия</td>
              <td className="py-2">600 000 ₽</td>
            </tr>
            <tr className="">
              <td className="py-2 pr-3"><Link className="text-accent hover:underline" href="/katalog/pavilony/p-08">P-08</Link></td>
              <td className="py-2 pr-3">остеклённый 8×6</td>
              <td className="py-2">1 250 000 ₽</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="mb-3 font-heading text-2xl">Беседка или павильон</h2>
      <p className="mb-8 max-w-3xl text-text-muted">
        Беседка — отдых на участке. Павильон — коммерческий/event контур. Не подменяем один другим в смете.
      </p>

      <p className="mb-8 text-sm">
        <Link className="text-accent hover:underline" href="/katalog/pavilony">
          Каталог павильонов
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/otkrytaya-besedka">
          Беседки
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/metallicheskiy-naves">
          Навесы
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/kontakty">
          Заявка
        </Link>
      </p>

      <FAQ items={FAQ_ITEMS} />
      <div className="mt-10">
        <h2 className="mb-3 font-heading text-2xl">Оставить заявку</h2>
        <LeadForm context="metallicheskiy-pavilon" />
      </div>
    </Container>
  );
}

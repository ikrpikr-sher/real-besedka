import type { Metadata } from 'next';
import Link from 'next/link';
import Container from '@/components/Container';
import Breadcrumbs from '@/components/Breadcrumbs';
import FAQ from '@/components/FAQ';
import JsonLd from '@/components/JsonLd';
import LeadForm from '@/components/LeadForm';
import CommerceHubNav from '@/components/CommerceHubNav';
import { getSeo } from '@/lib/seo';
import { getSite } from '@/lib/content';

const PATH = '/barbekyu-zona';

const FAQ_ITEMS = [
  {
    question: 'Делаете кирпичное барбекю?',
    answer:
      'Нет. Мы — металл и заводской каркас.',
  },
  {
    question: 'Можно ли под навесом?',
    answer:
      'Да, зона + навес или беседка «Огонь».',
  }
];

export function generateMetadata(): Metadata {
  const seo = getSeo(PATH, {
    title: 'Барбекю-зона из металла — от 245 000 ₽ | Реал Беседки',
    description: 'Барбекю-зоны Реал Беседки: очаг M-04 от 245 000 ₽, зоны «Огонь» от 400 000 ₽, беседки с мангалом от 420 000 ₽. Москва и МО.',
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
      images: [{ url: '/images/mangaly/barbekyu-zona-loft.jpg', width: 1200, height: 800 }],
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
    name: 'Барбекю-зона из металла',
    url: `${site.siteUrl}${PATH}`,
    description: 'Барбекю-зоны Реал Беседки: очаг M-04 от 245 000 ₽, зоны «Огонь» от 400 000 ₽, беседки с мангалом от 420 000 ₽. Москва и МО.',
  };

  return (
    <Container className="page-section">
      <JsonLd data={[pageLd, faqLd]} />
      <Breadcrumbs
        items={[
          { label: 'Главная', href: '/' },
          { label: 'Барбекю-зона', href: PATH },
        ]}
      />
      <p className="text-sm font-medium text-accent">Стационарный очаг, не складной мангал</p>
      <h1 className="page-title mb-4">Барбекю-зона из металла</h1>
      <p className="mb-4 max-w-3xl text-text-muted">
        «Барбекю-зона» в запросе — стационарная кухня на улице. У нас M-04 «Очаг» от 245 000 ₽ и линейка «Огонь» от 400 000 ₽. Каркас и сталь под порошок, не кирпичная кладка под ключ.
      </p>
      <p className="mb-8 max-w-3xl text-text-muted">
        Если нужна кровля и стол в одном объёме — беседка с мангалом.
      </p>

      <h2 className="mb-3 font-heading text-2xl">Варианты</h2>
      <div className="mb-8 overflow-x-auto">
        <table className="w-full min-w-[32rem] text-left text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="py-2 pr-3">Вариант</th>
              <th className="py-2 pr-3">Состав</th>
              <th className="py-2">Цена от</th>
            </tr>
          </thead>
          <tbody className="text-text-muted">
            <tr className="border-b border-border">
              <td className="py-2 pr-3"><Link className="text-accent hover:underline" href="/katalog/mangaly/m-04">M-04 Очаг</Link></td>
              <td className="py-2 pr-3">барбекю-зона</td>
              <td className="py-2">245 000 ₽</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-3"><Link className="text-accent hover:underline" href="/katalog/mangaly/m-07">Зоны Огонь</Link></td>
              <td className="py-2 pr-3">мангальная зона</td>
              <td className="py-2">400 000 ₽</td>
            </tr>
            <tr className="">
              <td className="py-2 pr-3"><Link className="text-accent hover:underline" href="/katalog/besedki-s-mangalom/bm-32">BM-32</Link></td>
              <td className="py-2 pr-3">беседка 3×2 + мангал</td>
              <td className="py-2">420 000 ₽</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="mb-3 font-heading text-2xl">Отличие от мангала</h2>
      <p className="mb-8 max-w-3xl text-text-muted">
        Мангал — жаровня. Барбекю-зона — столешницы, место под казан/мойку по карточке, стационарная постановка.
      </p>

      <p className="mb-8 text-sm">
        <Link className="text-accent hover:underline" href="/katalog/mangaly">
          Мангалы
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/mangalnaya-zona">
          Мангальные зоны
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/besedka-s-mangalom-pod-klyuch">
          С мангалом
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/metallicheskiy-naves">
          Навесы
        </Link>
      </p>

      <CommerceHubNav current="/barbekyu-zona" />
      <FAQ items={FAQ_ITEMS} />
      <div className="mt-10">
        <h2 className="mb-3 font-heading text-2xl">Оставить заявку</h2>
        <LeadForm context="barbekyu-zona" />
      </div>
    </Container>
  );
}

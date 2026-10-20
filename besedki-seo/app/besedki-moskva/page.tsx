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

const PATH = '/besedki-moskva';

const FAQ_ITEMS = [
  {
    question: 'Доставка за МКАД?',
    answer:
      'Да, считаем по адресу после выбора модели.',
  },
  {
    question: 'Можно посмотреть на заводе?',
    answer:
      'Да, Складочная 3с3 — по записи.',
  }
];

export function generateMetadata(): Metadata {
  const seo = getSeo(PATH, {
    title: 'Беседки в Москве — металлические под ключ | Реал Беседки',
    description: 'Металлические беседки в Москве и МО: производство на Складочной, монтаж под ключ. От 95 000 ₽. Реал Беседки, ООО «Пулман».',
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
    name: 'Беседки в Москве',
    url: `${site.siteUrl}${PATH}`,
    description: 'Металлические беседки в Москве и МО: производство на Складочной, монтаж под ключ. От 95 000 ₽. Реал Беседки, ООО «Пулман».',
  };

  return (
    <Container className="page-section">
      <JsonLd data={[pageLd, faqLd]} />
      <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Беседки в Москве', href: PATH }]} />
      <p className="text-sm font-medium text-accent">Производство и монтаж в одном городе</p>
      <h1 className="page-title mb-4">Беседки в Москве</h1>
      <p className="mb-4 max-w-3xl text-text-muted">
        Ищем «беседки Москва» — часто дерево и объявления. Мы — завод на Складочной 3с3: проектирование, ЧПУ, порошок, выезд инженера по Москве и МО, монтаж за день после основания.
      </p>
      <p className="mb-8 max-w-3xl text-text-muted">
        Гео городов МО не плодим клонами: одна посадочная + выезд. Цены от 95 000 ₽.
      </p>

      <h2 className="mb-3 font-heading text-2xl">Что закрываем в Москве</h2>
      <ul className="mb-8 max-w-3xl list-disc space-y-2 pl-5 text-text-muted">
        <li><Link className="text-accent hover:underline" href="/kupit-metallicheskuyu-besedku">Купить металлическую беседку</Link></li>
        <li><Link className="text-accent hover:underline" href="/besedka-pod-klyuch">Под ключ</Link></li>
        <li><Link className="text-accent hover:underline" href="/dostavka-i-montazh">Доставка и монтаж</Link></li>
        <li><Link className="text-accent hover:underline" href="/besedka-na-svayah">На сваях</Link></li>
        <li><Link className="text-accent hover:underline" href="/kontakty">Контакты и схема проезда</Link></li>
      </ul>

      <h2 className="mb-3 font-heading text-2xl">Не делаем</h2>
      <p className="mb-8 max-w-3xl text-text-muted">
        Отдельные тонкие страницы «беседка Химки / Одинцово / …» — они крадут crawl у коммерции. Город уточняем в заявке и смете.
      </p>

      <p className="mb-8 text-sm">
        <Link className="text-accent hover:underline" href="/kupit-besedku">
          Купить
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/proizvoditel-besedok">
          Производитель
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/regiony">
          Регионы
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/kontakty">
          Контакты
        </Link>
      </p>

      <CommerceHubNav current="/besedki-moskva" />
      <FAQ items={FAQ_ITEMS} />
      <div className="mt-10">
        <h2 className="mb-3 font-heading text-2xl">Оставить заявку</h2>
        <LeadForm context="besedki-moskva" />
      </div>
    </Container>
  );
}

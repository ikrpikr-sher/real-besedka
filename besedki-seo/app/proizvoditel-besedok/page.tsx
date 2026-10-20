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

const PATH = '/proizvoditel-besedok';

const FAQ_ITEMS = [
  {
    question: 'Где производство?',
    answer:
      'Москва, Складочная 3с3.',
  },
  {
    question: 'Работаете по РФ?',
    answer:
      'База — Москва и МО. Другие регионы — по запросу.',
  },
  {
    question: 'Гарантия?',
    answer:
      'Срок службы конструкции более 10 лет; условия — в договоре.',
  }
];

export function generateMetadata(): Metadata {
  const seo = getSeo(PATH, {
    title: 'Производитель металлических беседок — Реал Беседки, ООО «Пулман»',
    description: 'Производитель металлических беседок в Москве: каркас 80×80×3 мм, ЧПУ, порошок. Реал Беседки — бренд ООО «Пулман». Каталог и цены.',
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
    name: 'Производитель металлических беседок',
    url: `${site.siteUrl}${PATH}`,
    description: 'Производитель металлических беседок в Москве: каркас 80×80×3 мм, ЧПУ, порошок. Реал Беседки — бренд ООО «Пулман». Каталог и цены.',
  };

  return (
    <Container className="page-section">
      <JsonLd data={[pageLd, faqLd]} />
      <Breadcrumbs
        items={[
          { label: 'Главная', href: '/' },
          { label: 'Производитель беседок', href: PATH },
        ]}
      />
      <p className="text-sm font-medium text-accent">Завод на Складочной, не перекуп</p>
      <h1 className="page-title mb-4">Производитель металлических беседок</h1>
      <p className="mb-4 max-w-3xl text-text-muted">
        Реал Беседки — бренд производителя ООО «Пулман»: проектирование, лазер/плазма, пескоструй, порошковая камера, отгрузка и монтаж. Адрес производства — Москва, Складочная ул., 3с3.
      </p>
      <p className="mb-8 max-w-3xl text-text-muted">
        В договоре и на сайте — оба имени, чтобы не путать с одноимёнными перекупами и отелем Pullman.
      </p>

      <h2 className="mb-3 font-heading text-2xl">Что производим</h2>
      <ul className="mb-8 max-w-3xl list-disc space-y-2 pl-5 text-text-muted">
        <li>Открытые и остеклённые беседки, лофт C8.</li>
        <li>Беседки с мангалом «Огонь», мангальные зоны.</li>
        <li>Навесы, качели, павильоны «Форум».</li>
      </ul>

      <h2 className="mb-3 font-heading text-2xl">Как заказать у завода</h2>
      <p className="mb-8 max-w-3xl text-text-muted">
        <Link className="text-accent hover:underline" href="/kupit-metallicheskuyu-besedku">Купить</Link> · <Link className="text-accent hover:underline" href="/zakazat-besedku">Заказать</Link> · <Link className="text-accent hover:underline" href="/o-kompanii">О компании</Link> · <Link className="text-accent hover:underline" href="/kontakty">Контакты</Link>
      </p>

      <p className="mb-8 text-sm">
        <Link className="text-accent hover:underline" href="/o-kompanii">
          О компании
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/kupit-metallicheskuyu-besedku">
          Купить
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/katalog">
          Каталог
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/kontakty">
          Контакты
        </Link>
      </p>

      <CommerceHubNav current="/proizvoditel-besedok" />
      <FAQ items={FAQ_ITEMS} />
      <div className="mt-10">
        <h2 className="mb-3 font-heading text-2xl">Оставить заявку</h2>
        <LeadForm context="proizvoditel-besedok" />
      </div>
    </Container>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import Container from '@/components/Container';
import Breadcrumbs from '@/components/Breadcrumbs';
import FAQ from '@/components/FAQ';
import JsonLd from '@/components/JsonLd';
import LeadForm from '@/components/LeadForm';
import { getSeo } from '@/lib/seo';
import { getSite } from '@/lib/content';

const PATH = '/zakazat-besedku';

const FAQ_ITEMS = [
  {
    question: 'Сколько ждать?',
    answer:
      'Типовая модель — от 7 дней в производстве. Нестандарт длиннее.',
  },
  {
    question: 'Можно без монтажа?',
    answer:
      'Да, комплектом. На МО чаще ставим сами.',
  },
  {
    question: 'Как быстро получить расчёт?',
    answer:
      'Оставьте заявку на этой странице — перезвоним в рабочий день.',
  }
];

export function generateMetadata(): Metadata {
  const seo = getSeo(PATH, {
    title: 'Заказать металлическую беседку в Москве — Реал Беседки',
    description: 'Заказать беседку у производителя: заявка, замер, договор, изготовление от 7 дней, монтаж. Открытые от 95 000 ₽. Москва и МО.',
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
    name: 'Заказать металлическую беседку',
    url: `${site.siteUrl}${PATH}`,
    description: 'Заказать беседку у производителя: заявка, замер, договор, изготовление от 7 дней, монтаж. Открытые от 95 000 ₽. Москва и МО.',
  };

  return (
    <Container className="page-section">
      <JsonLd data={[pageLd, faqLd]} />
      <Breadcrumbs
        items={[
          { label: 'Главная', href: '/' },
          { label: 'Заказать беседку', href: PATH },
        ]}
      />
      <p className="text-sm font-medium text-accent">Заявка → замер → завод → монтаж</p>
      <h1 className="page-title mb-4">Заказать металлическую беседку</h1>
      <p className="mb-4 max-w-3xl text-text-muted">
        Заказ идёт напрямую на производство: консультация, выезд инженера по Москве и МО, договор, изготовление от 7 дней на типовую модель, доставка и сборка.
      </p>
      <p className="mb-8 max-w-3xl text-text-muted">
        Ориентир цен: открытые от 95 000 ₽, остеклённые от 400 000 ₽, с мангалом от 420 000 ₽. Точная смета — после выбора модели и основания.
      </p>

      <h2 className="mb-3 font-heading text-2xl">Этапы</h2>
      <ul className="mb-8 max-w-3xl list-disc space-y-2 pl-5 text-text-muted">
        <li>Заявка или звонок +7 (495) 255-54-77.</li>
        <li>Подбор размера и серии (можно <Link className="text-accent hover:underline" href="/podbor-besedki">квиз</Link> / <Link className="text-accent hover:underline" href="/konfigurator">конфигуратор</Link>).</li>
        <li>Замер и смета с фундаментом.</li>
        <li>Производство → доставка → монтаж → сдача.</li>
      </ul>

      <h2 className="mb-3 font-heading text-2xl">Юрлица и оплата</h2>
      <p className="mb-8 max-w-3xl text-text-muted">
        Счёт, акт, НДС по схеме договора. Физлица — перевод на р/с ООО «Пулман», наличные или карта.
      </p>

      <p className="mb-8 text-sm">
        <Link className="text-accent hover:underline" href="/kupit-metallicheskuyu-besedku">
          Купить
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/besedka-pod-klyuch">
          Под ключ
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/tseny-na-besedki">
          Цены
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/kontakty">
          Контакты
        </Link>
      </p>

      <FAQ items={FAQ_ITEMS} />
      <div className="mt-10">
        <h2 className="mb-3 font-heading text-2xl">Оставить заявку</h2>
        <LeadForm context="zakazat-besedku" />
      </div>
    </Container>
  );
}

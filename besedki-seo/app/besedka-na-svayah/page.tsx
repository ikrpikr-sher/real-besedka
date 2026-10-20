import type { Metadata } from 'next';
import Link from 'next/link';
import Container from '@/components/Container';
import Breadcrumbs from '@/components/Breadcrumbs';
import FAQ from '@/components/FAQ';
import JsonLd from '@/components/JsonLd';
import LeadForm from '@/components/LeadForm';
import { getSeo } from '@/lib/seo';
import { getSite } from '@/lib/content';

const PATH = '/besedka-na-svayah';

const FAQ_ITEMS = [
  {
    question: 'Сваи входят в цену беседки?',
    answer:
      'Нет по умолчанию. Цена в каталоге — за конструкцию.',
  },
  {
    question: 'Можно ли на свои сваи?',
    answer:
      'Да, если шаг и уровень под нашу схему.',
  },
  {
    question: 'Остекление на сваях?',
    answer:
      'Возможно на расчёте; часто рекомендуем плиту.',
  }
];

export function generateMetadata(): Metadata {
  const seo = getSeo(PATH, {
    title: 'Беседка на сваях — монтаж в Москве и МО | Реал Беседки',
    description: 'Металлическая беседка на винтовых сваях: каркас 80×80, монтаж за день после свайного поля. Москва и МО. Реал Беседки.',
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
    name: 'Беседка на винтовых сваях',
    url: `${site.siteUrl}${PATH}`,
    description: 'Металлическая беседка на винтовых сваях: каркас 80×80, монтаж за день после свайного поля. Москва и МО. Реал Беседки.',
  };

  return (
    <Container className="page-section">
      <JsonLd data={[pageLd, faqLd]} />
      <Breadcrumbs
        items={[
          { label: 'Главная', href: '/' },
          { label: 'Беседка на сваях', href: PATH },
        ]}
      />
      <p className="text-sm font-medium text-accent">Частый фундамент для МО</p>
      <h1 className="page-title mb-4">Беседка на винтовых сваях</h1>
      <p className="mb-4 max-w-3xl text-text-muted">
        Винтовые сваи — типовое основание под наши беседки на глине и перепаде МО. Каркас 80×80 ставится на оголовки после проверки уровня. Стоимость свай — отдельная строка сметы.
      </p>
      <p className="mb-8 max-w-3xl text-text-muted">
        На торфе и высокой воде чаще плита — особенно под остекление. Решение — после выезда инженера.
      </p>

      <h2 className="mb-3 font-heading text-2xl">Как проходит</h2>
      <ul className="mb-8 max-w-3xl list-disc space-y-2 pl-5 text-text-muted">
        <li>Замер и выбор свай / плиты / ленты.</li>
        <li>Монтаж свайного поля (мы или ваш подрядчик по допускам).</li>
        <li>Сборка беседки на оголовки — обычно 1 день.</li>
        <li>Сдача геометрии и покрытия.</li>
      </ul>

      <h2 className="mb-3 font-heading text-2xl">Связанные страницы</h2>
      <p className="mb-8 max-w-3xl text-text-muted">
        <Link className="text-accent hover:underline" href="/dostavka-i-montazh">Доставка и монтаж</Link> · <Link className="text-accent hover:underline" href="/fundament-pod-besedku">Фундамент</Link> · <Link className="text-accent hover:underline" href="/uslugi/montazh-besedok">Услуга монтажа</Link>
      </p>

      <p className="mb-8 text-sm">
        <Link className="text-accent hover:underline" href="/dostavka-i-montazh">
          Доставка и монтаж
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/fundament-pod-besedku">
          Фундамент
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/besedka-pod-klyuch">
          Под ключ
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/kontakty">
          Заявка
        </Link>
      </p>

      <FAQ items={FAQ_ITEMS} />
      <div className="mt-10">
        <h2 className="mb-3 font-heading text-2xl">Оставить заявку</h2>
        <LeadForm context="besedka-na-svayah" />
      </div>
    </Container>
  );
}

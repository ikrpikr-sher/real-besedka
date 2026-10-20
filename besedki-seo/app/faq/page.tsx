import type { Metadata } from 'next';
import Link from 'next/link';
import Container from '@/components/Container';
import Breadcrumbs from '@/components/Breadcrumbs';
import FAQ from '@/components/FAQ';
import JsonLd from '@/components/JsonLd';
import LeadForm from '@/components/LeadForm';
import { getSeo } from '@/lib/seo';
import { getSite } from '@/lib/content';

const PATH = '/faq';

const FAQ_ITEMS = [
  {
    question: 'Какой профиль у стоек — 70 или 80?',
    answer:
      'Стойки 80×80×3 мм, обвязка 40×40×2 мм. Если где-то на старых блоках мелькает 70×70 у беседки — это ошибка копирайта. 70×70 бывает только у части садовых качелей.',
  },
  {
    question: 'Пол в базе — ДПК или фанера?',
    answer:
      'У открытых «Графит» в базе влагостойкая нескользящая фанера, ДПК — опция. У «Панорамы» ДПК в базе. Не обещаем ДПК в минимальной цене открытой 2×2.',
  },
  {
    question: 'Сколько длится монтаж?',
    answer:
      'Сборка разборного комплекта на готовом основании — обычно 1 день. Сваи или плита — отдельный выезд и срок.',
  },
  {
    question: 'Работаете ли за МКАД и по Новой Риге?',
    answer:
      'Да, Москва и МО: Химки, Одинцово, Красногорск, Мытищи, Подольск, Балашиха, Истра, Раменское, Королёв, Домодедово и дальше по замеру. Логистика от Складочной, 3с3.',
  },
  {
    question: 'Можно ли с НДС?',
    answer:
      'Для юрлиц — с НДС 22% или без НДС, схема в договоре. На сайте цены без привязки к налоговому режиму покупателя.',
  },
  {
    question: 'Это та же компания, что Пулман?',
    answer:
      'Да. «Реал Беседки» — бренд производителя ООО «Пулман». В договоре указаны оба имени, чтобы не путать с перекупами и отелем Pullman.',
  },
];

export function generateMetadata(): Metadata {
  const seo = getSeo(PATH, {
    title: 'Вопросы о металлических беседках — FAQ | Реал Беседки',
    description:
      'Ответы Реал Беседки: сроки, каркас 80×80×3 мм, пол, сваи, гарантия, НДС, доставка по Москве и МО. Что входит в беседку под ключ.',
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
      images: [{ url: '/images/hero-besedka.webp', width: 1200, height: 630 }],
    },
  };
}

export default function FaqHubPage() {
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
    name: 'Частые вопросы о беседках',
    url: `${site.siteUrl}${PATH}`,
  };

  return (
    <Container className="page-section">
      <JsonLd data={[pageLd, faqLd]} />
      <Breadcrumbs
        items={[
          { label: 'Главная', href: '/' },
          { label: 'Вопросы', href: PATH },
        ]}
      />
      <p className="text-sm font-medium text-accent">Короткие ответы без «зависит от многого»</p>
      <h1 className="page-title mb-4">Частые вопросы о беседках</h1>
      <p className="mb-8 max-w-3xl text-text-muted">
        Вопросы из заявок и мессенджера. Если нужен расчёт модели — форма ниже или страница{' '}
        <Link className="text-accent hover:underline" href="/kupit-metallicheskuyu-besedku">
          купить металлическую беседку
        </Link>
        .
      </p>
      <FAQ items={FAQ_ITEMS} />
      <p className="mt-8 text-sm">
        <Link className="text-accent hover:underline" href="/tseny-na-besedki">
          Цены
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/kontakty">
          Контакты
        </Link>
      </p>
      <div className="mt-10">
        <h2 className="mb-3 font-heading text-2xl">Оставить заявку</h2>
        <LeadForm context="faq" />
      </div>
    </Container>
  );
}

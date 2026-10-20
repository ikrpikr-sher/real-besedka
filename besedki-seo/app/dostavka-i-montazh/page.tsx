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

const PATH = '/dostavka-i-montazh';

const FAQ_ITEMS = [
  {
    question: 'Сколько стоит доставка?',
    answer:
      'По Москве и МО — отдельной строкой в смете после выбора модели и адреса. Не публикуем «фикс + ₽/км» как у мангал-магазинов: у разборной беседки другая машина и разгрузка. Ориентир даём в коммерческом предложении до оплаты.',
  },
  {
    question: 'Сколько длится монтаж?',
    answer:
      'Типовая открытая — около 1 дня. Остекление и крупные 5×5 могут занять дольше по графику бригады.',
  },
  {
    question: 'Делаете сваи сами?',
    answer:
      'Организуем основание или принимаем ваше готовое по допускам. Условия — в договоре.',
  }
];

export function generateMetadata(): Metadata {
  const seo = getSeo(PATH, {
    title: 'Доставка и монтаж беседок в Москве и МО — Реал Беседки',
    description: 'Доставка разборной металлической беседки и монтаж за 1 день: сваи, плита, лента. Москва и Московская область. Реал Беседки, ООО «Пулман».',
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
    name: 'Доставка и монтаж беседок',
    url: `${site.siteUrl}${PATH}`,
    description: 'Доставка разборной металлической беседки и монтаж за 1 день: сваи, плита, лента. Москва и Московская область. Реал Беседки, ООО «Пулман».',
  };

  return (
    <Container className="page-section">
      <JsonLd data={[pageLd, faqLd]} />
      <Breadcrumbs
        items={[
          { label: 'Главная', href: '/' },
          { label: 'Доставка и монтаж', href: PATH },
        ]}
      />
      <p className="text-sm font-medium text-accent">Разборный комплект → сборка за день</p>
      <h1 className="page-title mb-4">Доставка и монтаж беседок</h1>
      <p className="mb-4 max-w-3xl text-text-muted">
        Каркас едет разобранным: стойки 80×80×3 мм, обвязка, панели, кровля. На участке бригада собирает на болтах — обычно за один день после готовности основания. Это не «привезут и бросят у ворот».
      </p>
      <p className="mb-8 max-w-3xl text-text-muted">
        География — Москва и МО. Точная стоимость доставки зависит от адреса и объёма фуры; считаем в смете после выбора модели. Монтаж как услуга: <Link className="text-accent hover:underline" href="/uslugi/montazh-besedok">/uslugi/montazh-besedok</Link>.
      </p>

      <h2 className="mb-3 font-heading text-2xl">Как проходит день монтажа</h2>
      <ul className="mb-8 max-w-3xl list-disc space-y-2 pl-5 text-text-muted">
        <li>Проверка основания: сваи/плита в уровне, шаг под стойки.</li>
        <li>Сборка каркаса на болтах по схеме завода.</li>
        <li>Кровля металлочерепица, панели, пол.</li>
        <li>Сдача: геометрия проёмов, крепёж, покрытие.</li>
      </ul>

      <h2 className="mb-3 font-heading text-2xl">Основание</h2>
      <p className="mb-8 max-w-3xl text-text-muted">
        Винтовые сваи — частый вариант на глине МО. Плита — на торфе и высокой воде, особенно под остекление. Лента — по проекту. Без готового основания монтаж каркаса не начинаем: «под ключ» не значит «фундамент в подарок».
      </p>

      <h2 className="mb-3 font-heading text-2xl">Честно про тариф</h2>
      <p className="mb-8 max-w-3xl text-text-muted">
        У мангал-магазинов часто витрина «доставка МКАД 1000 ₽ + ₽/км». У полной беседки 80×80 другая логистика: фура/газель под объём, разгрузка комплекта, согласование заезда. Поэтому тариф — в смете, без выдуманной публичной сетки. Монтаж — обычно 1 день после готовности основания.
      </p>

      <h2 className="mb-3 font-heading text-2xl">Самовывоз и самосбор</h2>
      <p className="mb-8 max-w-3xl text-text-muted">
        Можно забрать комплект и собрать по инструкции. На гарантию покрытия и геометрию при самосборе влияют условия площадки — чаще закладываем наш монтаж. Покупка без монтажа: <Link className="text-accent hover:underline" href="/kupit-metallicheskuyu-besedku">купить беседку</Link>.
      </p>

      <p className="mb-8 text-sm">
        <Link className="text-accent hover:underline" href="/uslugi/montazh-besedok">
          Услуга монтажа
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/besedka-pod-klyuch">
          Под ключ
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/uslugi">
          Все услуги
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/kontakty">
          Заявка
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/tseny-na-besedki">
          Цены
        </Link>
      </p>

      <CommerceHubNav current="/dostavka-i-montazh" />
      <FAQ items={FAQ_ITEMS} />
      <div className="mt-10">
        <h2 className="mb-3 font-heading text-2xl">Оставить заявку</h2>
        <LeadForm context="dostavka-i-montazh" />
      </div>
    </Container>
  );
}

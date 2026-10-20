import type { Metadata } from 'next';
import Link from 'next/link';
import Container from '@/components/Container';
import Breadcrumbs from '@/components/Breadcrumbs';
import FAQ from '@/components/FAQ';
import JsonLd from '@/components/JsonLd';
import LeadForm from '@/components/LeadForm';
import CommerceHubNav from '@/components/CommerceHubNav';
import HubLeadCta from '@/components/HubLeadCta';
import HubProductPicks from '@/components/HubProductPicks';
import { getSeo } from '@/lib/seo';
import { getSite } from '@/lib/content';

const PATH = '/besedka-pod-klyuch';

const FAQ_ITEMS = [
  {
    question: 'Можно ли купить без монтажа?',
    answer:
      'Да, отгружаем комплект. На участке в МО чаще ставим сами — так сохраняется геометрия и гарантия на покрытие.',
  },
  {
    question: 'Под ключ включает фундамент?',
    answer:
      'Нет по умолчанию. Основание подбираем по грунту; стоимость свай/плиты — в смете отдельно.',
  },
  {
    question: 'Работаете с юрлицами?',
    answer:
      'Да: счёт, акт, НДС по схеме договора. Физлица — перевод на р/с ООО «Пулман», наличные или карта.',
  }
];

export function generateMetadata(): Metadata {
  const seo = getSeo(PATH, {
    title: 'Беседка под ключ в Москве — от 95 000 ₽ | Реал Беседки',
    description: 'Металлическая беседка под ключ: проект, производство, доставка и монтаж. Открытые от 95 000 ₽, остеклённые от 400 000 ₽. Москва и МО.',
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
    name: 'Беседка под ключ в Москве и МО',
    url: `${site.siteUrl}${PATH}`,
    description: 'Металлическая беседка под ключ: проект, производство, доставка и монтаж. Открытые от 95 000 ₽, остеклённые от 400 000 ₽. Москва и МО.',
  };

  return (
    <Container className="page-section">
      <JsonLd data={[pageLd, faqLd]} />
      <Breadcrumbs
        items={[
          { label: 'Главная', href: '/' },
          { label: 'Беседка под ключ', href: PATH },
        ]}
      />
      <p className="text-sm font-medium text-accent">От замера до сдачи за один контур</p>
      <h1 className="page-title mb-4">Беседка под ключ в Москве и МО</h1>
      <p className="mb-4 max-w-3xl text-text-muted">
        «Под ключ» у нас — не красивая фраза в объявлении. Это проект, заводской каркас 80×80×3 мм, пескоструй и порошок, доставка разборного комплекта и сборка бригадой на участке. Субподряда на монтаже нет.
      </p>
      <p className="mb-8 max-w-3xl text-text-muted">
        Цена модели в каталоге — за конструкцию. Фундамент/сваи, доставка за МКАД и опции считаются после замера. Открытые, остеклённые и с мангалом — карточки ниже.
      </p>
      <HubLeadCta note="Под ключ: проект, завод, доставка и монтаж. Смета после замера в Москве и МО." />
      <HubProductPicks slugs={['b-17', 'b-21', 'b-53', 'bm-11']} heading="Модели под ключ" />

      <h2 className="mb-3 font-heading text-2xl">Что входит</h2>
      <ul className="mb-8 max-w-3xl list-disc space-y-2 pl-5 text-text-muted">
        <li>Консультация и выбор серии/размера под участок.</li>
        <li>Изготовление на заводе ООО «Пулман» (Складочная, 3с3): ЧПУ, пескоструй, порошок.</li>
        <li>Доставка разборного комплекта по Москве и МО.</li>
        <li>Монтаж на готовое основание (сваи, плита, лента) — обычно 1 день.</li>
        <li>Сдача: геометрия, крепёж, покрытие.</li>
      </ul>

      <h2 className="mb-3 font-heading text-2xl">Что считают отдельно</h2>
      <p className="mb-8 max-w-3xl text-text-muted">
        Винтовые сваи или бетонное основание, электрика, нестандартный цвет RAL, ДПК вместо фанеры, шторы и сетки. Точная смета — после выезда инженера. Сервис монтажа: <Link className="text-accent hover:underline" href="/uslugi/montazh-besedok">монтаж беседок</Link>, доставка: <Link className="text-accent hover:underline" href="/dostavka-i-montazh">доставка и монтаж</Link>.
      </p>

      <h2 className="mb-3 font-heading text-2xl">Сроки</h2>
      <p className="mb-8 max-w-3xl text-text-muted">
        Типовая модель из каталога — изготовление от 7 дней. Нестандартный узор панелей и размер добавляют время на ЧПУ и окраску. Монтаж — в согласованный день после готовности фундамента.
      </p>

      <p className="mb-8 text-sm">
        <Link className="text-accent hover:underline" href="/kupit-metallicheskuyu-besedku">
          Купить
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/tseny-na-besedki">
          Цены
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/dostavka-i-montazh">
          Доставка и монтаж
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/katalog">
          Каталог
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/kontakty">
          Заявка
        </Link>
      </p>

      <CommerceHubNav current="/besedka-pod-klyuch" />
      <FAQ items={FAQ_ITEMS} />
      <div id="raschet" className="mt-10">
        <h2 className="mb-3 font-heading text-2xl">Оставить заявку</h2>
        <LeadForm context="besedka-pod-klyuch" />
      </div>
    </Container>
  );
}

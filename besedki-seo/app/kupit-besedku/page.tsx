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

const PATH = '/kupit-besedku';

const FAQ_ITEMS = [
  {
    question: 'Можно ли без монтажа?',
    answer:
      'Да. На МО чаще ставим сами — гарантия покрытия.',
  },
  {
    question: 'Работаете с юрлицами?',
    answer:
      'Да: счёт, акт, НДС по схеме договора.',
  }
];

export function generateMetadata(): Metadata {
  const seo = getSeo(PATH, {
    title: 'Купить беседку в Москве — от 95 000 ₽ | Реал Беседки',
    description: 'Купить беседку у производителя в Москве: металлические модели от 95 000 ₽, остекление от 400 000 ₽, монтаж в МО. Реал Беседки.',
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
    name: 'Купить беседку в Москве',
    url: `${site.siteUrl}${PATH}`,
    description: 'Купить беседку у производителя в Москве: металлические модели от 95 000 ₽, остекление от 400 000 ₽, монтаж в МО. Реал Беседки.',
  };

  return (
    <Container className="page-section">
      <JsonLd data={[pageLd, faqLd]} />
      <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Купить беседку', href: PATH }]} />
      <p className="text-sm font-medium text-accent">Заводской заказ, не объявление с Авито</p>
      <h1 className="page-title mb-4">Купить беседку в Москве</h1>
      <p className="mb-4 max-w-3xl text-text-muted">
        «Купить беседку» в выдаче — дерево, шатры и металл. Мы продаём только металлические беседки собственного производства: от заявки до монтажа. Не комплектующие «собери сам» из тонкой трубы.
      </p>
      <p className="mb-8 max-w-3xl text-text-muted">
        Старт линейки открытых — 2×2. Подбор размера — квиз или конфигуратор. Договор с ООО «Пулман». Цена модели — на карточках ниже.
      </p>
      <HubLeadCta note="Заявка на покупку: размер, открытая / остекление / мангал. Смета по Москве и МО." />
      <HubProductPicks
        slugs={['b-17', 'b-21', 'b-53', 'bm-11']}
        heading="Что чаще берут"
        catalogHref="/katalog"
        catalogLabel="Весь каталог"
      />

      <h2 className="mb-3 font-heading text-2xl">Как купить</h2>
      <ul className="mb-8 max-w-3xl list-disc space-y-2 pl-5 text-text-muted">
        <li>Выберите тип: <Link className="text-accent hover:underline" href="/otkrytaya-besedka">открытая</Link> / <Link className="text-accent hover:underline" href="/zakrytaya-besedka">закрытая</Link> / <Link className="text-accent hover:underline" href="/besedka-s-mangalom-pod-klyuch">с мангалом</Link>.</li>
        <li>Или сразу <Link className="text-accent hover:underline" href="/kupit-metallicheskuyu-besedku">купить металлическую</Link> — полный разбор покупки.</li>
        <li>Заявка на этой странице → замер → договор → изготовление от 7 дней.</li>
      </ul>

      <h2 className="mb-3 font-heading text-2xl">Цены ориентир</h2>
      <div className="mb-8 overflow-x-auto">
        <table className="w-full min-w-[32rem] text-left text-sm">
          <thead><tr className="border-b border-border">
              <th className="py-2 pr-3">Тип</th>
              <th className="py-2 pr-3">От</th>
              <th className="py-2">Хабы</th>
            </tr></thead>
          <tbody className="text-text-muted">
            <tr className="border-b border-border">
              <td className="py-2 pr-3">Открытая</td>
              <td className="py-2 pr-3">95 000 ₽</td>
              <td className="py-2"><Link className="text-accent hover:underline" href="/tseny-na-besedki">Цены</Link></td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-3">Остекление</td>
              <td className="py-2 pr-3">400 000 ₽</td>
              <td className="py-2"><Link className="text-accent hover:underline" href="/osteklennaya-besedka">Остеклённые</Link></td>
            </tr>
            <tr className="">
              <td className="py-2 pr-3">С мангалом</td>
              <td className="py-2 pr-3">420 000 ₽</td>
              <td className="py-2"><Link className="text-accent hover:underline" href="/besedka-s-mangalom-pod-klyuch">Огонь</Link></td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="mb-8 text-sm">
        <Link className="text-accent hover:underline" href="/kupit-metallicheskuyu-besedku">
          Купить металлическую
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/zakazat-besedku">
          Заказать
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

      <CommerceHubNav current="/kupit-besedku" />
      <FAQ items={FAQ_ITEMS} />
      <div id="raschet" className="mt-10">
        <h2 className="mb-3 font-heading text-2xl">Оставить заявку</h2>
        <LeadForm context="kupit-besedku" />
      </div>
    </Container>
  );
}

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

const PATH = '/metallicheskiy-naves';

const FAQ_ITEMS = [
  {
    question: 'Навес или беседка?',
    answer:
      'Беседка — пол, панели, место под стол. Навес — кровля и стойки. Разные задачи и разные страницы каталога.',
  },
  {
    question: 'Есть ли навес на две машины?',
    answer:
      'Drive 6×3 — ориентир под компактный парк. Точный расчёт — по ширине авто и участку.',
  },
  {
    question: 'Монтаж навеса сколько длится?',
    answer:
      'Обычно быстрее беседки: нет пола и панелей по кругу. Срок — в смете.',
  }
];

export function generateMetadata(): Metadata {
  const seo = getSeo(PATH, {
    title: 'Металлический навес — от 150 000 ₽ | Реал Беседки',
    description: 'Металлические навесы Реал Беседки: каркас 80×80, порошковая краска. City 5×3 от 150 000 ₽, Drive 6×3 от 180 000 ₽, Скат 5×4 от 200 000 ₽. Москва и МО.',
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
      images: [{ url: '/images/navesy/n-02-1.webp', width: 1200, height: 800 }],
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
    name: 'Металлический навес',
    url: `${site.siteUrl}${PATH}`,
    description: 'Металлические навесы Реал Беседки: каркас 80×80, порошковая краска. City 5×3 от 150 000 ₽, Drive 6×3 от 180 000 ₽, Скат 5×4 от 200 000 ₽. Москва и МО.',
  };

  return (
    <Container className="page-section">
      <JsonLd data={[pageLd, faqLd]} />
      <Breadcrumbs
        items={[
          { label: 'Главная', href: '/' },
          { label: 'Металлический навес', href: PATH },
        ]}
      />
      <p className="text-sm font-medium text-accent">Кровля над авто или террасой, не беседка</p>
      <h1 className="page-title mb-4">Металлический навес</h1>
      <p className="mb-4 max-w-3xl text-text-muted">
        Навес — это кровля на каркасе без пола-беседки и без посадки «как комната». У нас линейка «Лофт»: City 5×3 от 150 000 ₽, Drive 6×3 от 180 000 ₽, Скат 5×4 от 200 000 ₽. Тот же заводской металл 80×80 и порошок, что у беседок.
      </p>
      <p className="mb-8 max-w-3xl text-text-muted">
        Если нужен стол, панели и пол — смотрите <Link className="text-accent hover:underline" href="/otkrytaya-besedka">открытую беседку</Link>. Навес не заменяет беседку и наоборот.
      </p>

      <h2 className="mb-3 font-heading text-2xl">Модели навесов</h2>
      <div className="mb-8 overflow-x-auto">
        <table className="w-full min-w-[32rem] text-left text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="py-2 pr-3">Модель</th>
              <th className="py-2 pr-3">Размер</th>
              <th className="py-2">Цена от</th>
            </tr>
          </thead>
          <tbody className="text-text-muted">
            <tr className="border-b border-border">
              <td className="py-2 pr-3"><Link className="text-accent hover:underline" href="/katalog/navesy/n-02">N-02 City</Link></td>
              <td className="py-2 pr-3">5×3×2,5 м</td>
              <td className="py-2">150 000 ₽</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-3"><Link className="text-accent hover:underline" href="/katalog/navesy/n-01">N-01 Drive</Link></td>
              <td className="py-2 pr-3">6×3×2,5 м</td>
              <td className="py-2">180 000 ₽</td>
            </tr>
            <tr className="">
              <td className="py-2 pr-3"><Link className="text-accent hover:underline" href="/katalog/navesy/n-03">N-03 Скат</Link></td>
              <td className="py-2 pr-3">5×4×2,5 м</td>
              <td className="py-2">200 000 ₽</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="mb-3 font-heading text-2xl">Куда ставят</h2>
      <p className="mb-8 max-w-3xl text-text-muted">
        Парковка на 1–2 машины, зона у входа, кровля над террасой без остекления. Снеговая нагрузка МО закладывается в сечении каркаса — не тонкий поликарбонат на 40×20.
      </p>

      <p className="mb-8 text-sm">
        <Link className="text-accent hover:underline" href="/katalog/navesy">
          Каталог навесов
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/otkrytaya-besedka">
          Открытые беседки
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
        <Link className="text-accent hover:underline" href="/kontakty">
          Заявка
        </Link>
      </p>

      <CommerceHubNav current="/metallicheskiy-naves" />
      <FAQ items={FAQ_ITEMS} />
      <div className="mt-10">
        <h2 className="mb-3 font-heading text-2xl">Оставить заявку</h2>
        <LeadForm context="metallicheskiy-naves" />
      </div>
    </Container>
  );
}

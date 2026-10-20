import type { Metadata } from 'next';
import Link from 'next/link';
import Container from '@/components/Container';
import Breadcrumbs from '@/components/Breadcrumbs';
import FAQ from '@/components/FAQ';
import JsonLd from '@/components/JsonLd';
import LeadForm from '@/components/LeadForm';
import { getSeo } from '@/lib/seo';
import { getSite } from '@/lib/content';

const PATH = '/besedka-dlya-dachi';

const FAQ_ITEMS = [
  {
    question: 'Дерево или металл на дачу?',
    answer:
      'Дерево дешевле на старте и дороже в уходе. Металл с порошком — наш контур.',
  },
  {
    question: 'Можно ли без фундамента?',
    answer:
      'Временно — нет: ставим на сваи или плиту по грунту.',
  }
];

export function generateMetadata(): Metadata {
  const seo = getSeo(PATH, {
    title: 'Беседка для дачи из металла — от 95 000 ₽ | Реал Беседки',
    description: 'Металлическая беседка для дачи: открытые от 95 000 ₽, остеклённые от 400 000 ₽. Каркас 80×80, монтаж в МО. Реал Беседки.',
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
    name: 'Беседка для дачи из металла',
    url: `${site.siteUrl}${PATH}`,
    description: 'Металлическая беседка для дачи: открытые от 95 000 ₽, остеклённые от 400 000 ₽. Каркас 80×80, монтаж в МО. Реал Беседки.',
  };

  return (
    <Container className="page-section">
      <JsonLd data={[pageLd, faqLd]} />
      <Breadcrumbs
        items={[
          { label: 'Главная', href: '/' },
          { label: 'Беседка для дачи', href: PATH },
        ]}
      />
      <p className="text-sm font-medium text-accent">Дача МО: металл, не сруб на сезон</p>
      <h1 className="page-title mb-4">Беседка для дачи из металла</h1>
      <p className="mb-4 max-w-3xl text-text-muted">
        «Беседка для дачи» смешивает дерево, шатры и капитальный металл. Мы делаем заводской каркас 80×80×3 мм под участок в Москве и МО: открытые от 95 000 ₽, зимние от 400 000 ₽.
      </p>
      <p className="mb-8 max-w-3xl text-text-muted">
        Типовой выбор дачи: 2×3 / 3×4 открытая или «Панорама» 3×3, если нужны выходные зимой.
      </p>

      <h2 className="mb-3 font-heading text-2xl">Что берут на дачу</h2>
      <div className="mb-8 overflow-x-auto">
        <table className="w-full min-w-[32rem] text-left text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="py-2 pr-3">Задача</th>
              <th className="py-2 pr-3">Модель</th>
              <th className="py-2">Цена от</th>
            </tr>
          </thead>
          <tbody className="text-text-muted">
            <tr className="border-b border-border">
              <td className="py-2 pr-3">Минимум места</td>
              <td className="py-2 pr-3"><Link className="text-accent hover:underline" href="/besedka-2x2">2×2 Старт</Link></td>
              <td className="py-2">95 000 ₽</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-3">Стол на 8</td>
              <td className="py-2 pr-3"><Link className="text-accent hover:underline" href="/besedka-3x4">3×4 B-17</Link></td>
              <td className="py-2">185 000 ₽</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-3">Круглый год</td>
              <td className="py-2 pr-3"><Link className="text-accent hover:underline" href="/zimnyaya-besedka">Панорама 3×3</Link></td>
              <td className="py-2">400 000 ₽</td>
            </tr>
            <tr className="">
              <td className="py-2 pr-3">Шашлык внутри</td>
              <td className="py-2 pr-3"><Link className="text-accent hover:underline" href="/besedka-s-mangalom-pod-klyuch">Огонь</Link></td>
              <td className="py-2">420 000 ₽</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="mb-3 font-heading text-2xl">Нормы участка</h2>
      <p className="mb-8 max-w-3xl text-text-muted">
        Отступы от забора — по уставу СНТ/ИЖС. Мы даём габариты; согласование с правлением — на вашей стороне.
      </p>

      <p className="mb-8 text-sm">
        <Link className="text-accent hover:underline" href="/otkrytaya-besedka">
          Открытые
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/besedka-3x4">
          3×4
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/kupit-metallicheskuyu-besedku">
          Купить
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/tseny-na-besedki">
          Цены
        </Link>
      </p>

      <FAQ items={FAQ_ITEMS} />
      <div className="mt-10">
        <h2 className="mb-3 font-heading text-2xl">Оставить заявку</h2>
        <LeadForm context="besedka-dlya-dachi" />
      </div>
    </Container>
  );
}

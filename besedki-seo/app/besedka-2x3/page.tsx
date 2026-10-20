import type { Metadata } from 'next';
import Link from 'next/link';
import Container from '@/components/Container';
import Breadcrumbs from '@/components/Breadcrumbs';
import FAQ from '@/components/FAQ';
import JsonLd from '@/components/JsonLd';
import LeadForm from '@/components/LeadForm';
import { getSeo } from '@/lib/seo';
import { getSite } from '@/lib/content';

const PATH = '/besedka-2x3';

const FAQ_ITEMS = [
  {
    question: '2×3 — это 6 м²?',
    answer:
      'Пятно 2×3 = 6 м² в осях. Полезный пол чуть меньше из-за стоек.',
  },
  {
    question: 'Есть ли остеклённая 2×3?',
    answer:
      'В базе «Панорама» стартует с 3×3. Компактный зимний контур — Капсула; узкий открытый — B-19.',
  },
  {
    question: 'Чем 2×3 лучше 2×2?',
    answer:
      'Глубина 3 м даёт стол и проход. 2×2 — максимум чайная зона.',
  }
];

export function generateMetadata(): Metadata {
  const seo = getSeo(PATH, {
    title: 'Беседка 2×3 из металла — от 175 000 ₽ | Реал Беседки',
    description: 'Металлическая беседка 2×3: открытая B-19 от 175 000 ₽. Узкий двор, стол на 4–6. Каркас 80×80, Москва и МО.',
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
      images: [{ url: '/images/otkrytye-besedki/b-19/01_hero.jpg', width: 1200, height: 800 }],
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
    name: 'Беседка 2×3 из металла',
    url: `${site.siteUrl}${PATH}`,
    description: 'Металлическая беседка 2×3: открытая B-19 от 175 000 ₽. Узкий двор, стол на 4–6. Каркас 80×80, Москва и МО.',
  };

  return (
    <Container className="page-section">
      <JsonLd data={[pageLd, faqLd]} />
      <Breadcrumbs
        items={[
          { label: 'Главная', href: '/' },
          { label: 'Беседка 2×3', href: PATH },
        ]}
      />
      <p className="text-sm font-medium text-accent">Узкий двор без ощущения вагончика</p>
      <h1 className="page-title mb-4">Беседка 2×3 из металла</h1>
      <p className="mb-4 max-w-3xl text-text-muted">
        2×3 м — размер для участка, где 3×4 не встаёт по ширине или не нужен стол на десятерых. Открытая B-19 «Графит · Лофт» — от 175 000 ₽. Компактнее только 2×2 «Старт» от 95 000 ₽.
      </p>
      <p className="mb-8 max-w-3xl text-text-muted">
        Фасад 2 м к проходу, глубина 3 м к виду — или наоборот, если двор длинный. Не путать с 3×2 в серии «Огонь» (мангал внутри): там другая логика посадки.
      </p>

      <h2 className="mb-3 font-heading text-2xl">Модели рядом с 2×3</h2>
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
              <td className="py-2 pr-3"><Link className="text-accent hover:underline" href="/katalog/otkrytye-besedki/b-10">B-10 Старт</Link></td>
              <td className="py-2 pr-3">2×2</td>
              <td className="py-2">95 000 ₽</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-3"><Link className="text-accent hover:underline" href="/katalog/otkrytye-besedki/b-19">B-19</Link></td>
              <td className="py-2 pr-3">2×3</td>
              <td className="py-2">175 000 ₽</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-3"><Link className="text-accent hover:underline" href="/katalog/otkrytye-besedki/b-18">B-18</Link></td>
              <td className="py-2 pr-3">2,5×2,5</td>
              <td className="py-2">185 000 ₽</td>
            </tr>
            <tr className="">
              <td className="py-2 pr-3"><Link className="text-accent hover:underline" href="/katalog/besedki-s-mangalom/bm-32">BM-32 Огонь</Link></td>
              <td className="py-2 pr-3">3×2 мангал</td>
              <td className="py-2">420 000 ₽</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="mb-3 font-heading text-2xl">Сколько человек</h2>
      <p className="mb-8 max-w-3xl text-text-muted">
        Стол 120–140 см: 4 комфортно, 6 плотно. На шашлыки с компанией 8+ смотрите <Link className="text-accent hover:underline" href="/besedka-3x4">3×4</Link> или <Link className="text-accent hover:underline" href="/besedka-4x4">4×4</Link>.
      </p>

      <h2 className="mb-3 font-heading text-2xl">Когда брать 2×3</h2>
      <p className="mb-8 max-w-3xl text-text-muted">
        Узкий двор у забора, чай на двоих–четверых, компактный лофт у дома. Если место позволяет — 3×4 даёт заметно больше свободы за стульями.
      </p>

      <p className="mb-8 text-sm">
        <Link className="text-accent hover:underline" href="/katalog/otkrytye-besedki/b-19">
          B-19 в каталоге
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/besedka-3x3">
          3×3
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/besedka-3x4">
          3×4
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/otkrytaya-besedka">
          Открытые
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/tseny-na-besedki">
          Цены
        </Link>
      </p>

      <FAQ items={FAQ_ITEMS} />
      <div className="mt-10">
        <h2 className="mb-3 font-heading text-2xl">Оставить заявку</h2>
        <LeadForm context="besedka-2x3" />
      </div>
    </Container>
  );
}

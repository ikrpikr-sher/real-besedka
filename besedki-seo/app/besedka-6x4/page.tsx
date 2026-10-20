import type { Metadata } from 'next';
import Link from 'next/link';
import Container from '@/components/Container';
import Breadcrumbs from '@/components/Breadcrumbs';
import FAQ from '@/components/FAQ';
import JsonLd from '@/components/JsonLd';
import LeadForm from '@/components/LeadForm';
import { getSeo } from '@/lib/seo';
import { getSite } from '@/lib/content';

const PATH = '/besedka-6x4';

const FAQ_ITEMS = [
  {
    question: '6×4 или 5×4?',
    answer:
      '6×4 длиннее по фасаду. 5×4 дешевле в базе (от 450 000 ₽).',
  },
  {
    question: 'Нужен ли фундамент?',
    answer:
      'Да, после замера. Крупный каркас не ставим «на грунт».',
  }
];

export function generateMetadata(): Metadata {
  const seo = getSeo(PATH, {
    title: 'Беседка 6×4 (6 на 4) из металла — от 680 000 ₽ | Реал Беседки',
    description: 'Металлическая беседка 6×4: открытая B-47 от 680 000 ₽, остеклённая B-27 от 820 000 ₽. Каркас 80×80. Москва и МО.',
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
    name: 'Беседка 6×4 из металла',
    url: `${site.siteUrl}${PATH}`,
    description: 'Металлическая беседка 6×4: открытая B-47 от 680 000 ₽, остеклённая B-27 от 820 000 ₽. Каркас 80×80. Москва и МО.',
  };

  return (
    <Container className="page-section">
      <JsonLd data={[pageLd, faqLd]} />
      <Breadcrumbs
        items={[
          { label: 'Главная', href: '/' },
          { label: 'Беседка 6×4', href: PATH },
        ]}
      />
      <p className="text-sm font-medium text-accent">24 м² под большую компанию</p>
      <h1 className="page-title mb-4">Беседка 6×4 (6 на 4) из металла</h1>
      <p className="mb-4 max-w-3xl text-text-muted">
        6×4 м — пятно 24 м². Открытая B-47 «Дамаск+» — от 680 000 ₽. Остеклённая B-27 — от 820 000 ₽, B-37 — от 930 000 ₽.
      </p>
      <p className="mb-8 max-w-3xl text-text-muted">
        Ближе к квадрату, чем 6×3: больше глубина под второй ряд или зону отдыха. Шестигранник Ø6 (B-56) — другая геометрия от 400 000 ₽.
      </p>

      <h2 className="mb-3 font-heading text-2xl">Модели</h2>
      <div className="mb-8 overflow-x-auto">
        <table className="w-full min-w-[32rem] text-left text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="py-2 pr-3">Модель</th>
              <th className="py-2 pr-3">Контур</th>
              <th className="py-2">Цена от</th>
            </tr>
          </thead>
          <tbody className="text-text-muted">
            <tr className="border-b border-border">
              <td className="py-2 pr-3"><Link className="text-accent hover:underline" href="/katalog/otkrytye-besedki/b-47">B-47 Дамаск+</Link></td>
              <td className="py-2 pr-3">открытая 6×4</td>
              <td className="py-2">680 000 ₽</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-3"><Link className="text-accent hover:underline" href="/katalog/besedki-s-ostekleniem/b-27">B-27</Link></td>
              <td className="py-2 pr-3">стекло 6×4</td>
              <td className="py-2">820 000 ₽</td>
            </tr>
            <tr className="">
              <td className="py-2 pr-3"><Link className="text-accent hover:underline" href="/katalog/besedki-s-ostekleniem/b-37">B-37</Link></td>
              <td className="py-2 pr-3">стекло + лазер</td>
              <td className="py-2">930 000 ₽</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="mb-3 font-heading text-2xl">Посадка</h2>
      <p className="mb-8 max-w-3xl text-text-muted">
        Фасад 6 м к виду. Основание — чаще плита или усиленные сваи: вес и парусность выше 3×4.
      </p>

      <p className="mb-8 text-sm">
        <Link className="text-accent hover:underline" href="/katalog/otkrytye-besedki/b-47">
          B-47
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/besedka-6x3">
          6×3
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/besedka-6x5">
          6×5
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/besedka-5x4">
          5×4
        </Link>
      </p>

      <FAQ items={FAQ_ITEMS} />
      <div className="mt-10">
        <h2 className="mb-3 font-heading text-2xl">Оставить заявку</h2>
        <LeadForm context="besedka-6x4" />
      </div>
    </Container>
  );
}

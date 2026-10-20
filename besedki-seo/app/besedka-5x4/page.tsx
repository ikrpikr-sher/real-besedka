import type { Metadata } from 'next';
import Link from 'next/link';
import Container from '@/components/Container';
import Breadcrumbs from '@/components/Breadcrumbs';
import FAQ from '@/components/FAQ';
import JsonLd from '@/components/JsonLd';
import LeadForm from '@/components/LeadForm';
import { getSeo } from '@/lib/seo';
import { getSite } from '@/lib/content';

const PATH = '/besedka-5x4';

const FAQ_ITEMS = [
  {
    question: '5×4 или 4×4?',
    answer:
      '5×4 длиннее по фасаду: удобнее банкетный стол. 4×4 компактнее и дешевле в базе (от 230 000 ₽).',
  },
  {
    question: 'Нужна ли плита под 5×4?',
    answer:
      'Часто да на слабом грунте: конструкция тяжелее 3×4. Решение — после замера.',
  },
  {
    question: 'Есть ли лофт 5×4?',
    answer:
      'Крупные лофт C8 в каталоге — другие габариты (6×3, 8×6). 5×4 закрываем «Панорамой» и открытой серией.',
  }
];

export function generateMetadata(): Metadata {
  const seo = getSeo(PATH, {
    title: 'Беседка 5×4 из металла — от 450 000 ₽ | Реал Беседки',
    description: 'Металлическая беседка 5×4: открытая B-16 от 450 000 ₽, остеклённая B-24 от 720 000 ₽, с мангалом BM-16 от 650 000 ₽. Москва и МО.',
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
      images: [{ url: '/images/proekty/b-16-1.webp', width: 1200, height: 800 }],
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
    name: 'Беседка 5×4 из металла',
    url: `${site.siteUrl}${PATH}`,
    description: 'Металлическая беседка 5×4: открытая B-16 от 450 000 ₽, остеклённая B-24 от 720 000 ₽, с мангалом BM-16 от 650 000 ₽. Москва и МО.',
  };

  return (
    <Container className="page-section">
      <JsonLd data={[pageLd, faqLd]} />
      <Breadcrumbs
        items={[
          { label: 'Главная', href: '/' },
          { label: 'Беседка 5×4', href: PATH },
        ]}
      />
      <p className="text-sm font-medium text-accent">20 м² под большую компанию</p>
      <h1 className="page-title mb-4">Беседка 5×4 из металла</h1>
      <p className="mb-4 max-w-3xl text-text-muted">
        5×4 м — пятно 20 м² для стола на 12–16 и свободного прохода. Открытая «Лесная жизнь» B-16 — от 450 000 ₽. С мангалом BM-16 — от 650 000 ₽. Остеклённая «Простор» B-24 — от 720 000 ₽.
      </p>
      <p className="mb-8 max-w-3xl text-text-muted">
        Если нужен квадрат той же площади — смотрите 5×5. Если компания до 10 — часто хватает <Link className="text-accent hover:underline" href="/besedka-4x4">4×4</Link>.
      </p>

      <h2 className="mb-3 font-heading text-2xl">Модели 5×4</h2>
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
              <td className="py-2 pr-3"><Link className="text-accent hover:underline" href="/katalog/otkrytye-besedki/b-16">B-16 Лесная жизнь</Link></td>
              <td className="py-2 pr-3">открытая 5×4×3 м</td>
              <td className="py-2">450 000 ₽</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-3"><Link className="text-accent hover:underline" href="/katalog/otkrytye-besedki/b-44">B-44 Средняя Азия</Link></td>
              <td className="py-2 pr-3">открытая, лазер</td>
              <td className="py-2">580 000 ₽</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-3"><Link className="text-accent hover:underline" href="/katalog/besedki-s-mangalom/bm-16">BM-16 Огонь</Link></td>
              <td className="py-2 pr-3">мангал 5×4</td>
              <td className="py-2">650 000 ₽</td>
            </tr>
            <tr className="">
              <td className="py-2 pr-3"><Link className="text-accent hover:underline" href="/katalog/besedki-s-ostekleniem/b-24">B-24 Простор</Link></td>
              <td className="py-2 pr-3">стекло 5×4</td>
              <td className="py-2">720 000 ₽</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="mb-3 font-heading text-2xl">Посадка</h2>
      <p className="mb-8 max-w-3xl text-text-muted">
        Фасад 5 м к виду — длинный стол вдоль окна/проёма. Глубина 4 м даёт второй ряд стульев или зону барбекю у торца в серии «Огонь». Каркас 80×80×3 мм, монтаж после готовности основания.
      </p>

      <p className="mb-8 text-sm">
        <Link className="text-accent hover:underline" href="/katalog/otkrytye-besedki/b-16">
          B-16
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/besedka-4x4">
          4×4
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/besedka-5x5">
          5×5
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/besedka-s-mangalom-pod-klyuch">
          С мангалом
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/tseny-na-besedki">
          Цены
        </Link>
      </p>

      <FAQ items={FAQ_ITEMS} />
      <div className="mt-10">
        <h2 className="mb-3 font-heading text-2xl">Оставить заявку</h2>
        <LeadForm context="besedka-5x4" />
      </div>
    </Container>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import Container from '@/components/Container';
import Breadcrumbs from '@/components/Breadcrumbs';
import FAQ from '@/components/FAQ';
import JsonLd from '@/components/JsonLd';
import LeadForm from '@/components/LeadForm';
import { getSeo } from '@/lib/seo';
import { getSite } from '@/lib/content';

const PATH = '/besedka-2-5x2-5';

const FAQ_ITEMS = [
  {
    question: 'Чем лучше 2×2?',
    answer:
      'Больше проход и стол. Цена выше — это другой объём металла и панелей.',
  },
  {
    question: 'Или сразу 3×3?',
    answer:
      'Если место есть — 3×3 заметно просторнее. 2,5×2,5 — компромисс на узком пятне.',
  }
];

export function generateMetadata(): Metadata {
  const seo = getSeo(PATH, {
    title: 'Беседка 2,5×2,5 из металла — от 185 000 ₽ | Реал Беседки',
    description: 'Металлическая беседка 2,5×2,5 B-18 от 185 000 ₽. Квадрат больше 2×2, меньше 3×3. Каркас 80×80. Москва и МО.',
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
      images: [{ url: '/images/otkrytye-besedki/b-18/01_hero.jpg', width: 1200, height: 800 }],
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
    name: 'Беседка 2,5×2,5 из металла',
    url: `${site.siteUrl}${PATH}`,
    description: 'Металлическая беседка 2,5×2,5 B-18 от 185 000 ₽. Квадрат больше 2×2, меньше 3×3. Каркас 80×80. Москва и МО.',
  };

  return (
    <Container className="page-section">
      <JsonLd data={[pageLd, faqLd]} />
      <Breadcrumbs
        items={[
          { label: 'Главная', href: '/' },
          { label: 'Беседка 2,5×2,5', href: PATH },
        ]}
      />
      <p className="text-sm font-medium text-accent">Квадрат между «стартом» и 3×3</p>
      <h1 className="page-title mb-4">Беседка 2,5×2,5 из металла</h1>
      <p className="mb-4 max-w-3xl text-text-muted">
        2,5×2,5 м — квадрат ~6,25 м². Открытая B-18 — от 185 000 ₽. Удобнее 2×2 за счёт прохода, дешевле и компактнее 3×3 «Медведи».
      </p>
      <p className="mb-8 max-w-3xl text-text-muted">
        Рядом по духу — шестигранник Ø2,5 м B-51 от 185 000 ₽, если нужен круглый силуэт.
      </p>

      <h2 className="mb-3 font-heading text-2xl">Сравнение</h2>
      <div className="mb-8 overflow-x-auto">
        <table className="w-full min-w-[32rem] text-left text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="py-2 pr-3">Модель</th>
              <th className="py-2 pr-3">Пятно</th>
              <th className="py-2">Цена от</th>
            </tr>
          </thead>
          <tbody className="text-text-muted">
            <tr className="border-b border-border">
              <td className="py-2 pr-3"><Link className="text-accent hover:underline" href="/katalog/otkrytye-besedki/b-10">B-10</Link></td>
              <td className="py-2 pr-3">2×2</td>
              <td className="py-2">95 000 ₽</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-3"><Link className="text-accent hover:underline" href="/katalog/otkrytye-besedki/b-18">B-18</Link></td>
              <td className="py-2 pr-3">2,5×2,5</td>
              <td className="py-2">185 000 ₽</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-3"><Link className="text-accent hover:underline" href="/katalog/otkrytye-besedki/b-12">B-12 Медведи</Link></td>
              <td className="py-2 pr-3">3×3</td>
              <td className="py-2">240 000 ₽</td>
            </tr>
            <tr className="">
              <td className="py-2 pr-3"><Link className="text-accent hover:underline" href="/katalog/otkrytye-besedki/b-51">B-51 шестигранник</Link></td>
              <td className="py-2 pr-3">Ø2,5</td>
              <td className="py-2">185 000 ₽</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="mb-3 font-heading text-2xl">Посадка</h2>
      <p className="mb-8 max-w-3xl text-text-muted">
        Стол ~120 см: 4 комфортно. Фасад к виду, от забора — по уставу СНТ.
      </p>

      <p className="mb-8 text-sm">
        <Link className="text-accent hover:underline" href="/katalog/otkrytye-besedki/b-18">
          B-18
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/besedka-2x2">
          2×2
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/besedka-3x3">
          3×3
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/shestigrannaya-besedka">
          Шестигранные
        </Link>
      </p>

      <FAQ items={FAQ_ITEMS} />
      <div className="mt-10">
        <h2 className="mb-3 font-heading text-2xl">Оставить заявку</h2>
        <LeadForm context="besedka-2-5x2-5" />
      </div>
    </Container>
  );
}

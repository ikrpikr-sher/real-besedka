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

const PATH = '/besedka-2x2';

const FAQ_ITEMS = [
  {
    question: '2×2 — это 4 м²?',
    answer:
      'Да, в осях. Полезный пол чуть меньше.',
  },
  {
    question: 'Есть ли остеклённая 2×2?',
    answer:
      '«Панорама» стартует с 3×3. Компакт зимой — Капсула, не 2×2.',
  },
  {
    question: 'Что в базе B-10?',
    answer:
      'Каркас 80×80×3, кровля, пол фанера, панели. ДПК и шторы — опции.',
  }
];

export function generateMetadata(): Metadata {
  const seo = getSeo(PATH, {
    title: 'Беседка 2×2 (2 на 2) из металла — от 95 000 ₽ | Реал Беседки',
    description: 'Металлическая беседка 2×2 «Старт» B-10 от 95 000 ₽. Компактный каркас 80×80 для маленького участка. Москва и МО.',
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
      images: [{ url: '/images/proekty/b-10-2.webp', width: 1200, height: 800 }],
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
    name: 'Беседка 2×2 из металла',
    url: `${site.siteUrl}${PATH}`,
    description: 'Металлическая беседка 2×2 «Старт» B-10 от 95 000 ₽. Компактный каркас 80×80 для маленького участка. Москва и МО.',
  };

  return (
    <Container className="page-section">
      <JsonLd data={[pageLd, faqLd]} />
      <Breadcrumbs
        items={[
          { label: 'Главная', href: '/' },
          { label: 'Беседка 2×2', href: PATH },
        ]}
      />
      <p className="text-sm font-medium text-accent">Вход в каталог, не шатёр за 15 тысяч</p>
      <h1 className="page-title mb-4">Беседка 2×2 (2 на 2) из металла</h1>
      <p className="mb-4 max-w-3xl text-text-muted">
        2×2 м — минимальное пятно под чайную зону. Открытая «Старт» B-10 — от 95 000 ₽: каркас 80×80×3 мм, металлочерепица, пол фанера. Это не поликарбонат на тонкой трубе.
      </p>
      <p className="mb-8 max-w-3xl text-text-muted">
        На компанию 6+ смотрите 2×3 или 3×4. 2×2 — когда место у забора узкое или нужен «первый» каркас на участке.
      </p>

      <h2 className="mb-3 font-heading text-2xl">Модели рядом</h2>
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
            <tr className="">
              <td className="py-2 pr-3"><Link className="text-accent hover:underline" href="/katalog/otkrytye-besedki/b-18">B-18</Link></td>
              <td className="py-2 pr-3">2,5×2,5</td>
              <td className="py-2">185 000 ₽</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="mb-3 font-heading text-2xl">Кому хватает</h2>
      <p className="mb-8 max-w-3xl text-text-muted">
        Двое–четверо со столиком. Шашлык — рядом чашей, не внутри. Если нужен стол на 8 — сразу <Link className="text-accent hover:underline" href="/besedka-3x4">3×4</Link>.
      </p>

      <p className="mb-8 text-sm">
        <Link className="text-accent hover:underline" href="/katalog/otkrytye-besedki/b-10">
          B-10
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/besedka-2x3">
          2×3
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

      <CommerceHubNav current="/besedka-2x2" />
      <FAQ items={FAQ_ITEMS} />
      <div className="mt-10">
        <h2 className="mb-3 font-heading text-2xl">Оставить заявку</h2>
        <LeadForm context="besedka-2x2" />
      </div>
    </Container>
  );
}

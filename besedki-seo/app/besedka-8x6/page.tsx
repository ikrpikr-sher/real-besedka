import type { Metadata } from 'next';
import Link from 'next/link';
import Container from '@/components/Container';
import Breadcrumbs from '@/components/Breadcrumbs';
import FAQ from '@/components/FAQ';
import JsonLd from '@/components/JsonLd';
import LeadForm from '@/components/LeadForm';
import { getSeo } from '@/lib/seo';
import { getSite } from '@/lib/content';

const PATH = '/besedka-8x6';

const FAQ_ITEMS = [
  {
    question: '8×6 только лофт?',
    answer:
      'В каталоге 8×6 — остеклённые C8. Открытый восьмигранник Ø8 — отдельная модель B-57.',
  },
  {
    question: 'Срок монтажа?',
    answer:
      'Крупнее типовой: график после готовности основания.',
  }
];

export function generateMetadata(): Metadata {
  const seo = getSeo(PATH, {
    title: 'Беседка 8×6 лофт — от 1 280 000 ₽ | Реал Беседки',
    description: 'Остеклённая беседка лофт 8×6 C8: B-55 / B-63 от 1 280 000 ₽. Каркас 80×80, стекло, профнастил. Москва и МО.',
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
    name: 'Беседка 8×6 лофт',
    url: `${site.siteUrl}${PATH}`,
    description: 'Остеклённая беседка лофт 8×6 C8: B-55 / B-63 от 1 280 000 ₽. Каркас 80×80, стекло, профнастил. Москва и МО.',
  };

  return (
    <Container className="page-section">
      <JsonLd data={[pageLd, faqLd]} />
      <Breadcrumbs
        items={[
          { label: 'Главная', href: '/' },
          { label: 'Беседка 8×6', href: PATH },
        ]}
      />
      <p className="text-sm font-medium text-accent">Крупный остеклённый лофт</p>
      <h1 className="page-title mb-4">Беседка 8×6 лофт</h1>
      <p className="mb-4 max-w-3xl text-text-muted">
        8×6 м — флагманский остеклённый лофт C8: B-55 и B-63 (беж) от 1 280 000 ₽. Это уже «комната на участке», не дачная чайная.
      </p>
      <p className="mb-8 max-w-3xl text-text-muted">
        Меньше по бюджету — лофт 3×4 / 6×3 или «Панорама» 4×4–5×5.
      </p>

      <h2 className="mb-3 font-heading text-2xl">Линейка</h2>
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
              <td className="py-2 pr-3"><Link className="text-accent hover:underline" href="/katalog/besedki-osteklennye-loft/b-54">B-54</Link></td>
              <td className="py-2 pr-3">лофт 3×3</td>
              <td className="py-2">480 000 ₽</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-3"><Link className="text-accent hover:underline" href="/katalog/besedki-osteklennye-loft/b-53">B-53</Link></td>
              <td className="py-2 pr-3">лофт 3×4</td>
              <td className="py-2">550 000 ₽</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-3"><Link className="text-accent hover:underline" href="/katalog/besedki-osteklennye-loft/b-62">B-62</Link></td>
              <td className="py-2 pr-3">лофт 6×3</td>
              <td className="py-2">780 000 ₽</td>
            </tr>
            <tr className="">
              <td className="py-2 pr-3"><Link className="text-accent hover:underline" href="/katalog/besedki-osteklennye-loft/b-55">B-55</Link></td>
              <td className="py-2 pr-3">лофт 8×6</td>
              <td className="py-2">1 280 000 ₽</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="mb-3 font-heading text-2xl">Инженерия</h2>
      <p className="mb-8 max-w-3xl text-text-muted">
        Плита или усиленные сваи, скрытая электрика по карточке. Конденсат на холодном контуре — см. разбор B-63 в блоге.
      </p>

      <p className="mb-8 text-sm">
        <Link className="text-accent hover:underline" href="/besedka-loft">
          Лофт
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/katalog/besedki-osteklennye-loft/b-55">
          B-55
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/zimnyaya-besedka">
          Зимние
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/tseny-na-besedki">
          Цены
        </Link>
      </p>

      <FAQ items={FAQ_ITEMS} />
      <div className="mt-10">
        <h2 className="mb-3 font-heading text-2xl">Оставить заявку</h2>
        <LeadForm context="besedka-8x6" />
      </div>
    </Container>
  );
}

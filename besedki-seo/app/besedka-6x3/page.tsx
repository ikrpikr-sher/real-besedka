import type { Metadata } from 'next';
import Link from 'next/link';
import Container from '@/components/Container';
import Breadcrumbs from '@/components/Breadcrumbs';
import FAQ from '@/components/FAQ';
import JsonLd from '@/components/JsonLd';
import LeadForm from '@/components/LeadForm';
import { getSeo } from '@/lib/seo';
import { getSite } from '@/lib/content';

const PATH = '/besedka-6x3';

const FAQ_ITEMS = [
  {
    question: '6×3 — это 18 м²?',
    answer:
      'Да, в осях.',
  },
  {
    question: 'Чем отличается от 3×6?',
    answer:
      'У нас фасад 6 м × глубина 3 м в карточках. Поворот осей — на замере.',
  },
  {
    question: 'Есть ли 6×3 с мангалом?',
    answer:
      'Да, BM-14 от 530 000 ₽.',
  }
];

export function generateMetadata(): Metadata {
  const seo = getSeo(PATH, {
    title: 'Беседка 6×3 из металла — от 330 000 ₽ | Реал Беседки',
    description: 'Металлическая беседка 6×3: открытая B-14 от 330 000 ₽, лофт Салон+ B-62 от 780 000 ₽, с мангалом BM-14 от 530 000 ₽. Москва и МО.',
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
      images: [{ url: '/images/proekty/b-14-1.webp', width: 1200, height: 800 }],
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
    name: 'Беседка 6×3 из металла',
    url: `${site.siteUrl}${PATH}`,
    description: 'Металлическая беседка 6×3: открытая B-14 от 330 000 ₽, лофт Салон+ B-62 от 780 000 ₽, с мангалом BM-14 от 530 000 ₽. Москва и МО.',
  };

  return (
    <Container className="page-section">
      <JsonLd data={[pageLd, faqLd]} />
      <Breadcrumbs
        items={[
          { label: 'Главная', href: '/' },
          { label: 'Беседка 6×3', href: PATH },
        ]}
      />
      <p className="text-sm font-medium text-accent">Длинный фасад 6 м, глубина 3 м</p>
      <h1 className="page-title mb-4">Беседка 6×3 из металла</h1>
      <p className="mb-4 max-w-3xl text-text-muted">
        6×3 м — вытянутое пятно 18 м²: длинный стол вдоль фасада и узкая глубина. Открытая «Рыцари» B-14 — от 330 000 ₽. С мангалом BM-14 — от 530 000 ₽. Остеклённый лофт «Салон+» B-62 — от 780 000 ₽.
      </p>
      <p className="mb-8 max-w-3xl text-text-muted">
        Если нужна квадратная посадка — смотрите 4×4 или 5×5. Если глубина важнее — 6×4 / 6×5.
      </p>

      <h2 className="mb-3 font-heading text-2xl">Модели 6×3</h2>
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
              <td className="py-2 pr-3"><Link className="text-accent hover:underline" href="/katalog/otkrytye-besedki/b-14">B-14 Рыцари</Link></td>
              <td className="py-2 pr-3">открытая 6×3</td>
              <td className="py-2">330 000 ₽</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-3"><Link className="text-accent hover:underline" href="/katalog/besedki-s-mangalom/bm-14">BM-14 Огонь</Link></td>
              <td className="py-2 pr-3">мангал 6×3</td>
              <td className="py-2">530 000 ₽</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-3"><Link className="text-accent hover:underline" href="/katalog/otkrytye-besedki/b-46">B-46</Link></td>
              <td className="py-2 pr-3">открытая, лазер</td>
              <td className="py-2">560 000 ₽</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-3"><Link className="text-accent hover:underline" href="/katalog/besedki-s-ostekleniem/b-26">B-26</Link></td>
              <td className="py-2 pr-3">стекло 6×3</td>
              <td className="py-2">720 000 ₽</td>
            </tr>
            <tr className="">
              <td className="py-2 pr-3"><Link className="text-accent hover:underline" href="/katalog/besedki-osteklennye-loft/b-62">B-62 Лофт Салон+</Link></td>
              <td className="py-2 pr-3">лофт C8 6×3</td>
              <td className="py-2">780 000 ₽</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="mb-3 font-heading text-2xl">Когда брать</h2>
      <p className="mb-8 max-w-3xl text-text-muted">
        Участок вдоль забора или дома, банкетный стол на 10–14, лофт-галерея. Не путать с навесом 6×3 Drive — там нет пола-беседки.
      </p>

      <p className="mb-8 text-sm">
        <Link className="text-accent hover:underline" href="/katalog/otkrytye-besedki/b-14">
          B-14
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/besedka-6x4">
          6×4
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/besedka-loft">
          Лофт
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/besedka-s-mangalom-pod-klyuch">
          С мангалом
        </Link>
      </p>

      <FAQ items={FAQ_ITEMS} />
      <div className="mt-10">
        <h2 className="mb-3 font-heading text-2xl">Оставить заявку</h2>
        <LeadForm context="besedka-6x3" />
      </div>
    </Container>
  );
}

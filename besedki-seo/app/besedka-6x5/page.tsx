import type { Metadata } from 'next';
import Link from 'next/link';
import Container from '@/components/Container';
import Breadcrumbs from '@/components/Breadcrumbs';
import FAQ from '@/components/FAQ';
import JsonLd from '@/components/JsonLd';
import LeadForm from '@/components/LeadForm';
import { getSeo } from '@/lib/seo';
import { getSite } from '@/lib/content';

const PATH = '/besedka-6x5';

const FAQ_ITEMS = [
  {
    question: '6×5 — это 30 м²?',
    answer:
      'Да, в осях.',
  },
  {
    question: 'Сроки изготовления?',
    answer:
      'Крупнее типовой 3×4: срок уточняем в договоре после конфигурации.',
  }
];

export function generateMetadata(): Metadata {
  const seo = getSeo(PATH, {
    title: 'Беседка 6×5 из металла — от 780 000 ₽ | Реал Беседки',
    description: 'Металлическая беседка 6×5: открытая B-48 от 780 000 ₽, с мангалом BM-48 от 880 000 ₽, остеклённая от 920 000 ₽. Москва и МО.',
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
    name: 'Беседка 6×5 из металла',
    url: `${site.siteUrl}${PATH}`,
    description: 'Металлическая беседка 6×5: открытая B-48 от 780 000 ₽, с мангалом BM-48 от 880 000 ₽, остеклённая от 920 000 ₽. Москва и МО.',
  };

  return (
    <Container className="page-section">
      <JsonLd data={[pageLd, faqLd]} />
      <Breadcrumbs
        items={[
          { label: 'Главная', href: '/' },
          { label: 'Беседка 6×5', href: PATH },
        ]}
      />
      <p className="text-sm font-medium text-accent">30 м² — стол и зона отдыха</p>
      <h1 className="page-title mb-4">Беседка 6×5 из металла</h1>
      <p className="mb-4 max-w-3xl text-text-muted">
        6×5 м — 30 м² в осях. Открытая B-48 «Александрия+» — от 780 000 ₽. С мангалом BM-48 — от 880 000 ₽. Остекление B-28 — от 920 000 ₽.
      </p>
      <p className="mb-8 max-w-3xl text-text-muted">
        Формат «почти зал»: две зоны без тесноты. Для меньшего бюджета — 5×5 или 6×4.
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
              <td className="py-2 pr-3"><Link className="text-accent hover:underline" href="/katalog/otkrytye-besedki/b-48">B-48</Link></td>
              <td className="py-2 pr-3">открытая 6×5</td>
              <td className="py-2">780 000 ₽</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-3"><Link className="text-accent hover:underline" href="/katalog/besedki-s-mangalom/bm-48">BM-48 Огонь</Link></td>
              <td className="py-2 pr-3">мангал 6×5</td>
              <td className="py-2">880 000 ₽</td>
            </tr>
            <tr className="">
              <td className="py-2 pr-3"><Link className="text-accent hover:underline" href="/katalog/besedki-s-ostekleniem/b-28">B-28</Link></td>
              <td className="py-2 pr-3">стекло 6×5</td>
              <td className="py-2">920 000 ₽</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="mb-3 font-heading text-2xl">Кому</h2>
      <p className="mb-8 max-w-3xl text-text-muted">
        Регулярные приёмы 15+, мангал внутри без тесноты, остеклённая гостиная на участке.
      </p>

      <p className="mb-8 text-sm">
        <Link className="text-accent hover:underline" href="/katalog/otkrytye-besedki/b-48">
          B-48
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/besedka-6x4">
          6×4
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/besedka-5x5">
          5×5
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/besedka-s-mangalom-pod-klyuch">
          С мангалом
        </Link>
      </p>

      <FAQ items={FAQ_ITEMS} />
      <div className="mt-10">
        <h2 className="mb-3 font-heading text-2xl">Оставить заявку</h2>
        <LeadForm context="besedka-6x5" />
      </div>
    </Container>
  );
}

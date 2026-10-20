import type { Metadata } from 'next';
import Link from 'next/link';
import Container from '@/components/Container';
import Breadcrumbs from '@/components/Breadcrumbs';
import FAQ from '@/components/FAQ';
import JsonLd from '@/components/JsonLd';
import LeadForm from '@/components/LeadForm';
import { getSeo } from '@/lib/seo';
import { getSite } from '@/lib/content';

const PATH = '/besedka-panorama';

const FAQ_ITEMS = [
  {
    question: 'Панорама или лофт?',
    answer:
      'Панорама — «аквариум» со стеклом. Лофт C8 — стекло + профнастил.',
  },
  {
    question: 'Мангал в Панораме?',
    answer:
      'Нет. Огонь — серия «Огонь».',
  }
];

export function generateMetadata(): Metadata {
  const seo = getSeo(PATH, {
    title: 'Беседка «Панорама» — остекление от 400 000 ₽ | Реал Беседки',
    description: 'Серия беседок «Панорама»: Капсула 3×3 от 400 000 ₽, Веранда+ 3×4 от 440 000 ₽, Салон 4×4 от 490 000 ₽. Москва и МО.',
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
    name: 'Беседка «Панорама»',
    url: `${site.siteUrl}${PATH}`,
    description: 'Серия беседок «Панорама»: Капсула 3×3 от 400 000 ₽, Веранда+ 3×4 от 440 000 ₽, Салон 4×4 от 490 000 ₽. Москва и МО.',
  };

  return (
    <Container className="page-section">
      <JsonLd data={[pageLd, faqLd]} />
      <Breadcrumbs
        items={[
          { label: 'Главная', href: '/' },
          { label: 'Беседка Панорама', href: PATH },
        ]}
      />
      <p className="text-sm font-medium text-accent">Остеклённая серия завода</p>
      <h1 className="page-title mb-4">Беседка «Панорама»</h1>
      <p className="mb-4 max-w-3xl text-text-muted">
        «Панорама» — наша остеклённая линейка на каркасе 80×80×3 мм: раздвижные стеклопакеты, пол ДПК в базе. Старт — «Капсула» 3×3 от 400 000 ₽.
      </p>
      <p className="mb-8 max-w-3xl text-text-muted">
        Лофт C8 — соседняя остеклённая серия с профнастилом, не путать названия в смете.
      </p>

      <h2 className="mb-3 font-heading text-2xl">Линейка Панорама</h2>
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
              <td className="py-2 pr-3"><Link className="text-accent hover:underline" href="/katalog/besedki-s-ostekleniem/b-21">B-21 Капсула</Link></td>
              <td className="py-2 pr-3">3×3</td>
              <td className="py-2">400 000 ₽</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-3"><Link className="text-accent hover:underline" href="/katalog/besedki-s-ostekleniem/b-22">B-22 Веранда+</Link></td>
              <td className="py-2 pr-3">3×4</td>
              <td className="py-2">440 000 ₽</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-3"><Link className="text-accent hover:underline" href="/katalog/besedki-s-ostekleniem/b-23">B-23 Салон</Link></td>
              <td className="py-2 pr-3">4×4</td>
              <td className="py-2">490 000 ₽</td>
            </tr>
            <tr className="">
              <td className="py-2 pr-3"><Link className="text-accent hover:underline" href="/katalog/besedki-s-ostekleniem/b-24">B-24 Простор</Link></td>
              <td className="py-2 pr-3">5×4</td>
              <td className="py-2">720 000 ₽</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="mb-3 font-heading text-2xl">Куда ещё</h2>
      <p className="mb-8 max-w-3xl text-text-muted">
        <Link className="text-accent hover:underline" href="/osteklennaya-besedka">Остеклённые</Link> · <Link className="text-accent hover:underline" href="/zimnyaya-besedka">Зимние</Link> · <Link className="text-accent hover:underline" href="/besedka-loft">Лофт C8</Link>
      </p>

      <p className="mb-8 text-sm">
        <Link className="text-accent hover:underline" href="/katalog/besedki-s-ostekleniem">
          Каталог
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/osteklennaya-besedka">
          Остеклённые
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
        <LeadForm context="besedka-panorama" />
      </div>
    </Container>
  );
}

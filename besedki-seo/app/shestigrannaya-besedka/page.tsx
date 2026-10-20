import type { Metadata } from 'next';
import Link from 'next/link';
import Container from '@/components/Container';
import Breadcrumbs from '@/components/Breadcrumbs';
import FAQ from '@/components/FAQ';
import JsonLd from '@/components/JsonLd';
import LeadForm from '@/components/LeadForm';
import { getSeo } from '@/lib/seo';
import { getSite } from '@/lib/content';

const PATH = '/shestigrannaya-besedka';

const FAQ_ITEMS = [
  {
    question: 'Шестигранная = ротонда?',
    answer:
      'Близко по силуэту. У нас грани и заводские панели, не кованая «беседка-ротонда» с рынка.',
  },
  {
    question: 'Есть ли остеклённый шестигранник?',
    answer:
      'В базе — открытые. Зимний контур — «Панорама» прямоугольная.',
  },
  {
    question: 'Ø6 — это много?',
    answer:
      'Да: нужна площадь и основание. Для дачи чаще Ø2,5–3.',
  }
];

export function generateMetadata(): Metadata {
  const seo = getSeo(PATH, {
    title: 'Шестигранная беседка из металла — от 185 000 ₽ | Реал Беседки',
    description: 'Шестигранные металлические беседки: Ø2,5 м от 185 000 ₽, Ø3 м от 195 000 ₽, Ø6 м от 400 000 ₽. Каркас 80×80. Москва и МО.',
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
      images: [{ url: '/images/otkrytye-besedki/b-51/01_hero.jpg', width: 1200, height: 800 }],
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
    name: 'Шестигранная беседка из металла',
    url: `${site.siteUrl}${PATH}`,
    description: 'Шестигранные металлические беседки: Ø2,5 м от 185 000 ₽, Ø3 м от 195 000 ₽, Ø6 м от 400 000 ₽. Каркас 80×80. Москва и МО.',
  };

  return (
    <Container className="page-section">
      <JsonLd data={[pageLd, faqLd]} />
      <Breadcrumbs
        items={[
          { label: 'Главная', href: '/' },
          { label: 'Шестигранная беседка', href: PATH },
        ]}
      />
      <p className="text-sm font-medium text-accent">Круглый силуэт, заводской каркас</p>
      <h1 className="page-title mb-4">Шестигранная беседка из металла</h1>
      <p className="mb-4 max-w-3xl text-text-muted">
        Шестигранник в поиске часто ведёт на дерево и сварные парковые. У нас — металл 80×80×3 мм: B-51 Ø2,5 м от 185 000 ₽, B-52 Ø3 м от 195 000 ₽, B-56 Ø6 м от 400 000 ₽.
      </p>
      <p className="mb-8 max-w-3xl text-text-muted">
        Посадка кругом: стол в центре, проход по граням. Не путать с квадратом 3×3 / 4×4 — другая мебель и другая тень.
      </p>

      <h2 className="mb-3 font-heading text-2xl">Модели</h2>
      <div className="mb-8 overflow-x-auto">
        <table className="w-full min-w-[32rem] text-left text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="py-2 pr-3">Модель</th>
              <th className="py-2 pr-3">Диаметр</th>
              <th className="py-2">Цена от</th>
            </tr>
          </thead>
          <tbody className="text-text-muted">
            <tr className="border-b border-border">
              <td className="py-2 pr-3"><Link className="text-accent hover:underline" href="/katalog/otkrytye-besedki/b-51">B-51</Link></td>
              <td className="py-2 pr-3">Ø2,5 м</td>
              <td className="py-2">185 000 ₽</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-3"><Link className="text-accent hover:underline" href="/katalog/otkrytye-besedki/b-52">B-52</Link></td>
              <td className="py-2 pr-3">Ø3 м</td>
              <td className="py-2">195 000 ₽</td>
            </tr>
            <tr className="">
              <td className="py-2 pr-3"><Link className="text-accent hover:underline" href="/katalog/otkrytye-besedki/b-56">B-56</Link></td>
              <td className="py-2 pr-3">Ø6 м</td>
              <td className="py-2">400 000 ₽</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="mb-3 font-heading text-2xl">Когда брать шестигранник</h2>
      <p className="mb-8 max-w-3xl text-text-muted">
        Центр газона, акцент на силуэт, круглый стол. Для длинного банкета лучше прямоугольник 3×4 / 6×3.
      </p>

      <p className="mb-8 text-sm">
        <Link className="text-accent hover:underline" href="/katalog/otkrytye-besedki/b-51">
          B-51
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/vosmigrannaya-besedka">
          Восьмигранные
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/besedka-3x3">
          3×3
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/otkrytaya-besedka">
          Открытые
        </Link>
      </p>

      <FAQ items={FAQ_ITEMS} />
      <div className="mt-10">
        <h2 className="mb-3 font-heading text-2xl">Оставить заявку</h2>
        <LeadForm context="shestigrannaya-besedka" />
      </div>
    </Container>
  );
}

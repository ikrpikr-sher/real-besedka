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

const PATH = '/besedka-6x6';

const FAQ_ITEMS = [
  {
    question: 'Почему B-58 дешевле B-48 6×5?',
    answer:
      'Разная комплектация панелей и серии. Сравнивайте карточки, не только пятно.',
  },
  {
    question: 'Есть ли остеклённая 6×6?',
    answer:
      'Крупное остекление смотрите в павильонах и лофт 8×6; точный 6×6 стекло — по запросу.',
  }
];

export function generateMetadata(): Metadata {
  const seo = getSeo(PATH, {
    title: 'Беседка 6×6 (6 на 6) из металла — от 380 000 ₽ | Реал Беседки',
    description: 'Металлическая беседка 6×6: открытая B-58 от 380 000 ₽. Квадрат 36 м², каркас 80×80. Москва и МО.',
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
    name: 'Беседка 6×6 из металла',
    url: `${site.siteUrl}${PATH}`,
    description: 'Металлическая беседка 6×6: открытая B-58 от 380 000 ₽. Квадрат 36 м², каркас 80×80. Москва и МО.',
  };

  return (
    <Container className="page-section">
      <JsonLd data={[pageLd, faqLd]} />
      <Breadcrumbs
        items={[
          { label: 'Главная', href: '/' },
          { label: 'Беседка 6×6', href: PATH },
        ]}
      />
      <p className="text-sm font-medium text-accent">Крупный квадрат 36 м²</p>
      <h1 className="page-title mb-4">Беседка 6×6 (6 на 6) из металла</h1>
      <p className="mb-4 max-w-3xl text-text-muted">
        6×6 м — открытая B-58 от 380 000 ₽. Большое пятно под мероприятия на участке. Высота конька 4,0 м — воздух и свет.
      </p>
      <p className="mb-8 max-w-3xl text-text-muted">
        Не путать с шестигранником Ø6 (B-56): другая геометрия и другая посадка мебели.
      </p>

      <h2 className="mb-3 font-heading text-2xl">Рядом по площади</h2>
      <div className="mb-8 overflow-x-auto">
        <table className="w-full min-w-[32rem] text-left text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="py-2 pr-3">Модель</th>
              <th className="py-2 pr-3">Форма</th>
              <th className="py-2">Цена от</th>
            </tr>
          </thead>
          <tbody className="text-text-muted">
            <tr className="border-b border-border">
              <td className="py-2 pr-3"><Link className="text-accent hover:underline" href="/katalog/otkrytye-besedki/b-58">B-58</Link></td>
              <td className="py-2 pr-3">квадрат 6×6</td>
              <td className="py-2">380 000 ₽</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-3"><Link className="text-accent hover:underline" href="/katalog/otkrytye-besedki/b-56">B-56 шестигранник</Link></td>
              <td className="py-2 pr-3">Ø6</td>
              <td className="py-2">400 000 ₽</td>
            </tr>
            <tr className="">
              <td className="py-2 pr-3"><Link className="text-accent hover:underline" href="/katalog/otkrytye-besedki/b-48">B-48</Link></td>
              <td className="py-2 pr-3">6×5</td>
              <td className="py-2">780 000 ₽</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="mb-3 font-heading text-2xl">Основание</h2>
      <p className="mb-8 max-w-3xl text-text-muted">
        Обязателен расчёт свай/плиты. Монтаж крупнее типовой дачной 3×4 — закладываем в график бригады.
      </p>

      <p className="mb-8 text-sm">
        <Link className="text-accent hover:underline" href="/katalog/otkrytye-besedki/b-58">
          B-58
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/shestigrannaya-besedka">
          Шестигранные
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/besedka-6x5">
          6×5
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/metallicheskiy-pavilon">
          Павильоны
        </Link>
      </p>

      <CommerceHubNav current="/besedka-6x6" />
      <FAQ items={FAQ_ITEMS} />
      <div className="mt-10">
        <h2 className="mb-3 font-heading text-2xl">Оставить заявку</h2>
        <LeadForm context="besedka-6x6" />
      </div>
    </Container>
  );
}

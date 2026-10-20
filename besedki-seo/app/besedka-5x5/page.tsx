import type { Metadata } from 'next';
import Link from 'next/link';
import Container from '@/components/Container';
import Breadcrumbs from '@/components/Breadcrumbs';
import FAQ from '@/components/FAQ';
import JsonLd from '@/components/JsonLd';
import LeadForm from '@/components/LeadForm';
import CommerceHubNav from '@/components/CommerceHubNav';
import HubLeadCta from '@/components/HubLeadCta';
import HubProductPicks from '@/components/HubProductPicks';
import { getSeo } from '@/lib/seo';
import { getSite } from '@/lib/content';

const PATH = '/besedka-5x5';

const FAQ_ITEMS = [
  {
    question: '5×5 — это 25 м²?',
    answer:
      'Да, в осях. Полезный пол меньше на толщину стоек и панелей.',
  },
  {
    question: 'Сколько стоит монтаж 5×5?',
    answer:
      'Дольше и дороже типовой 3×4: больше металла и узлов. Смета после замера.',
  },
  {
    question: 'Есть ли 5×5 с мангалом?',
    answer:
      'Крупные «Огонь» смотрите в каталоге мангальных; 5×4 BM-16 — ближайший размер с очагом внутри.',
  }
];

export function generateMetadata(): Metadata {
  const seo = getSeo(PATH, {
    title: 'Беседка 5×5 (5 на 5) из металла — от 680 000 ₽ | Реал Беседки',
    description: 'Металлическая беседка 5×5: открытая B-45 от 680 000 ₽, остеклённая B-25 от 780 000 ₽. Каркас 80×80, Москва и МО.',
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
      images: [{ url: '/images/otkrytye-paneli/b-45/02-hero.webp', width: 1200, height: 800 }],
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
    name: 'Беседка 5×5 из металла',
    url: `${site.siteUrl}${PATH}`,
    description: 'Металлическая беседка 5×5: открытая B-45 от 680 000 ₽, остеклённая B-25 от 780 000 ₽. Каркас 80×80, Москва и МО.',
  };

  return (
    <Container className="page-section">
      <JsonLd data={[pageLd, faqLd]} />
      <Breadcrumbs
        items={[
          { label: 'Главная', href: '/' },
          { label: 'Беседка 5×5', href: PATH },
        ]}
      />
      <p className="text-sm font-medium text-accent">Квадрат 25 м² под банкет и зону отдыха</p>
      <h1 className="page-title mb-4">Беседка 5×5 (5 на 5) из металла</h1>
      <p className="mb-4 max-w-3xl text-text-muted">
        5×5 м — крупный квадрат 25 м². Открытая B-45 «Древняя Русь», остеклённая «Квадро» B-25, «Панорама · Древняя Русь» B-35. Цена каждой — на карточке.
      </p>
      <p className="mb-8 max-w-3xl text-text-muted">
        Это не дачная «чайная» 2×2: нужен участок и основание под вес. Если сомневаетесь в площади — начните с <Link className="text-accent hover:underline" href="/besedka-4x4">4×4</Link> или <Link className="text-accent hover:underline" href="/besedka-5x4">5×4</Link>.
      </p>
      <HubLeadCta note="5×5 м: открытая или стекло. Смета по участку в Москве и МО." />
      <HubProductPicks
        slugs={['b-45', 'b-25', 'b-35']}
        heading="Модели 5×5 в каталоге"
        catalogHref="/katalog/razmer/5x5"
        catalogLabel="Все 5×5"
      />

      <h2 className="mb-3 font-heading text-2xl">Модели 5×5</h2>
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
              <td className="py-2 pr-3"><Link className="text-accent hover:underline" href="/katalog/otkrytye-besedki/b-45">B-45 Древняя Русь</Link></td>
              <td className="py-2 pr-3">открытая 5×5×3 м</td>
              <td className="py-2">680 000 ₽</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-3"><Link className="text-accent hover:underline" href="/katalog/besedki-s-ostekleniem/b-25">B-25 Квадро</Link></td>
              <td className="py-2 pr-3">стекло 5×5</td>
              <td className="py-2">780 000 ₽</td>
            </tr>
            <tr className="">
              <td className="py-2 pr-3"><Link className="text-accent hover:underline" href="/katalog/besedki-s-ostekleniem/b-35">B-35 Панорама · Древняя Русь</Link></td>
              <td className="py-2 pr-3">стекло + лазер</td>
              <td className="py-2">890 000 ₽</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="mb-3 font-heading text-2xl">Кому нужен 5×5</h2>
      <p className="mb-8 max-w-3xl text-text-muted">
        Регулярные приёмы 15+, две зоны (стол + диваны), остеклённая «комната» без тесноты. Для двоих–шестерых — избыточно по цене и пятну.
      </p>

      <p className="mb-8 text-sm">
        <Link className="text-accent hover:underline" href="/katalog/otkrytye-besedki/b-45">
          B-45
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/besedka-5x4">
          5×4
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/besedka-4x4">
          4×4
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/osteklennaya-besedka">
          Остеклённые
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/tseny-na-besedki">
          Цены
        </Link>
      </p>

      <CommerceHubNav current="/besedka-5x5" />
      <FAQ items={FAQ_ITEMS} />
      <div id="raschet" className="mt-10">
        <h2 className="mb-3 font-heading text-2xl">Оставить заявку</h2>
        <LeadForm context="besedka-5x5" />
      </div>
    </Container>
  );
}

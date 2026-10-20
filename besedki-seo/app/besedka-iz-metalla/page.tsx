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

const PATH = '/besedka-iz-metalla';

const FAQ_ITEMS = [
  {
    question: 'Металл или дерево?',
    answer:
      'Дерево дешевле на входе. Металл с порошком — наш контур: без ежегодной перекраски стоек и с запасом под стекло.',
  },
  {
    question: 'Какой профиль трубы?',
    answer:
      '80×80×3 мм. Тоньше ради цены в выдаче не делаем.',
  },
  {
    question: 'Где производство?',
    answer:
      'Москва, Складочная 3с3, ООО «Пулман».',
  }
];

export function generateMetadata(): Metadata {
  const seo = getSeo(PATH, {
    title: 'Беседка из металла — от 95 000 ₽ | Реал Беседки',
    description: 'Беседка из металла от производителя: каркас 80×80×3 мм, ЧПУ-панели, порошок. Открытые от 95 000 ₽, остеклённые от 400 000 ₽. Москва и МО.',
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
    name: 'Беседка из металла',
    url: `${site.siteUrl}${PATH}`,
    description: 'Беседка из металла от производителя: каркас 80×80×3 мм, ЧПУ-панели, порошок. Открытые от 95 000 ₽, остеклённые от 400 000 ₽. Москва и МО.',
  };

  return (
    <Container className="page-section">
      <JsonLd data={[pageLd, faqLd]} />
      <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Беседка из металла', href: PATH }]} />
      <p className="text-sm font-medium text-accent">Не дерево и не поликарбонат — заводской каркас</p>
      <h1 className="page-title mb-4">Беседка из металла</h1>
      <p className="mb-4 max-w-3xl text-text-muted">
        «Беседка из металла» в поиске смешивает ковку, тонкую трубу с ПК и капитальный дизайн-металл. Реал Беседки — каркас 80×80×3 мм на болтах, металлочерепица, пол фанера в базе, панели 3 мм с ЧПУ.
      </p>
      <p className="mb-8 max-w-3xl text-text-muted">
        Открытые, хиты размера 3 на 3, 3 на 4, 4 на 4, остекление «Панорама», серия «Огонь». Цена — на карточках ниже.
      </p>
      <HubLeadCta />
      <HubProductPicks slugs={['b-10', 'b-17', 'b-21', 'bm-11']} heading="Беседки из металла" />

      <h2 className="mb-3 font-heading text-2xl">Чем мы не являемся</h2>
      <ul className="mb-8 max-w-3xl list-disc space-y-2 pl-5 text-text-muted">
        <li>Не шатёр и не сварной парковый павильон из 40×20.</li>
        <li>Не деревянная беседка «под ключ» за 130–180 тысяч — другой рынок.</li>
        <li>Не мангал-навес 2,4×1,5 м за 50 тысяч: у нас полная беседка с полом и посадкой.</li>
      </ul>

      <h2 className="mb-3 font-heading text-2xl">Куда идти по задаче</h2>
      <div className="mb-8 overflow-x-auto">
        <table className="w-full min-w-[32rem] text-left text-sm">
          <thead><tr className="border-b border-border">
              <th className="py-2 pr-3">Задача</th>
              <th className="py-2 pr-3">Страница</th>
              <th className="py-2">От</th>
            </tr></thead>
          <tbody className="text-text-muted">
            <tr className="border-b border-border">
              <td className="py-2 pr-3">Купить / каталог</td>
              <td className="py-2 pr-3"><Link className="text-accent hover:underline" href="/kupit-metallicheskuyu-besedku">Купить металлическую</Link></td>
              <td className="py-2">95 000 ₽</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-3">3 на 3</td>
              <td className="py-2 pr-3"><Link className="text-accent hover:underline" href="/besedka-3x3">Беседка 3×3</Link></td>
              <td className="py-2">240 000 ₽</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-3">3 на 4</td>
              <td className="py-2 pr-3"><Link className="text-accent hover:underline" href="/besedka-3x4">Беседка 3×4</Link></td>
              <td className="py-2">185 000 ₽</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-3">4 на 4</td>
              <td className="py-2 pr-3"><Link className="text-accent hover:underline" href="/besedka-4x4">Беседка 4×4</Link></td>
              <td className="py-2">230 000 ₽</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-3">Зима / стекло</td>
              <td className="py-2 pr-3"><Link className="text-accent hover:underline" href="/zimnyaya-besedka">Зимняя</Link></td>
              <td className="py-2">400 000 ₽</td>
            </tr>
            <tr className="">
              <td className="py-2 pr-3">С мангалом</td>
              <td className="py-2 pr-3"><Link className="text-accent hover:underline" href="/besedka-s-mangalom-pod-klyuch">Огонь</Link></td>
              <td className="py-2">420 000 ₽</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="mb-8 text-sm">
        <Link className="text-accent hover:underline" href="/metallicheskaya-besedka">
          Металлическая беседка
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/kupit-metallicheskuyu-besedku">
          Купить
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/katalog">
          Каталог
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/tseny-na-besedki">
          Цены
        </Link>
      </p>

      <CommerceHubNav current="/besedka-iz-metalla" />
      <FAQ items={FAQ_ITEMS} />
      <div id="raschet" className="mt-10">
        <h2 className="mb-3 font-heading text-2xl">Оставить заявку</h2>
        <LeadForm context="besedka-iz-metalla" />
      </div>
    </Container>
  );
}

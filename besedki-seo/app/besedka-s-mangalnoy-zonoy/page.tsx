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

const PATH = '/besedka-s-mangalnoy-zonoy';

const FAQ_ITEMS = [
  {
    question: 'Чем отличается от «с мангалом»?',
    answer:
      'Тот же оффер. Формулировка запроса другая — посадочные связаны.',
  },
  {
    question: 'Есть 4 на 4 с мангалом?',
    answer:
      'Да, BM-11 от 430 000 ₽.',
  }
];

export function generateMetadata(): Metadata {
  const seo = getSeo(PATH, {
    title: 'Беседка с мангальной зоной — от 420 000 ₽ | Реал Беседки',
    description: 'Беседка с мангальной зоной «Огонь»: жаровня и дымоход внутри каркаса 80×80. От 420 000 ₽. Москва и МО.',
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
      images: [{ url: '/images/mangaly/barbekyu-zona-loft.jpg', width: 1200, height: 800 }],
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
    name: 'Беседка с мангальной зоной',
    url: `${site.siteUrl}${PATH}`,
    description: 'Беседка с мангальной зоной «Огонь»: жаровня и дымоход внутри каркаса 80×80. От 420 000 ₽. Москва и МО.',
  };

  return (
    <Container className="page-section">
      <JsonLd data={[pageLd, faqLd]} />
      <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'С мангальной зоной', href: PATH }]} />
      <p className="text-sm font-medium text-accent">Очаг внутри беседки, не навес 2×1,5</p>
      <h1 className="page-title mb-4">Беседка с мангальной зоной</h1>
      <p className="mb-4 max-w-3xl text-text-muted">
        В выдаче «беседка с мангальной зоной» часто ведут к кирпичным комплексам и дешёвым навесам с жаровней. У нас — серия «Огонь»: полноценная металлическая беседка с мангалом и дымоходом внутри, от 420 000 ₽.
      </p>
      <p className="mb-8 max-w-3xl text-text-muted">
        Отдельно — мангальные зоны без большой беседки (от 48 000 ₽ за чашу, зоны от 400 000 ₽).
      </p>

      <h2 className="mb-3 font-heading text-2xl">Варианты</h2>
      <div className="mb-8 overflow-x-auto">
        <table className="w-full min-w-[32rem] text-left text-sm">
          <thead><tr className="border-b border-border">
              <th className="py-2 pr-3">Вариант</th>
              <th className="py-2 pr-3">Что</th>
              <th className="py-2">От</th>
            </tr></thead>
          <tbody className="text-text-muted">
            <tr className="border-b border-border">
              <td className="py-2 pr-3"><Link className="text-accent hover:underline" href="/besedka-s-mangalom-pod-klyuch">Беседки Огонь</Link></td>
              <td className="py-2 pr-3">мангал внутри</td>
              <td className="py-2">420 000 ₽</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-3"><Link className="text-accent hover:underline" href="/mangalnaya-zona">Мангальная зона</Link></td>
              <td className="py-2 pr-3">зона / чаша</td>
              <td className="py-2">48 000 ₽</td>
            </tr>
            <tr className="">
              <td className="py-2 pr-3"><Link className="text-accent hover:underline" href="/barbekyu-zona">Барбекю-зона</Link></td>
              <td className="py-2 pr-3">стационарный очаг</td>
              <td className="py-2">245 000 ₽</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="mb-3 font-heading text-2xl">Чего нет</h2>
      <p className="mb-8 max-w-3xl text-text-muted">
        Не ставим открытый огонь в остеклённую «Панораму». Для стекла — отдельная зона рядом или открытая серия «Огонь».
      </p>

      <p className="mb-8 text-sm">
        <Link className="text-accent hover:underline" href="/besedka-s-mangalom-pod-klyuch">
          С мангалом под ключ
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/mangalnaya-zona">
          Мангальные зоны
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/katalog/besedki-s-mangalom">
          Каталог
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/tseny-na-besedki">
          Цены
        </Link>
      </p>

      <CommerceHubNav current="/besedka-s-mangalnoy-zonoy" />
      <FAQ items={FAQ_ITEMS} />
      <div className="mt-10">
        <h2 className="mb-3 font-heading text-2xl">Оставить заявку</h2>
        <LeadForm context="besedka-s-mangalnoy-zonoy" />
      </div>
    </Container>
  );
}

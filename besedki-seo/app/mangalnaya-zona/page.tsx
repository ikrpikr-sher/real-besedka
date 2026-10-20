import type { Metadata } from 'next';
import Link from 'next/link';
import Container from '@/components/Container';
import Breadcrumbs from '@/components/Breadcrumbs';
import FAQ from '@/components/FAQ';
import JsonLd from '@/components/JsonLd';
import LeadForm from '@/components/LeadForm';
import { getSeo } from '@/lib/seo';
import { getSite } from '@/lib/content';

const PATH = '/mangalnaya-zona';

const FAQ_ITEMS = [
  {
    question: 'Нужен ли навес над мангалом?',
    answer:
      'Для зоны «Огонь» кровля в комплектации. Чаша — открытый очаг, навес обсуждаем отдельно.',
  },
  {
    question: 'Можно ли поставить в «Панораму»?',
    answer:
      'Огонь в остеклённой «Панораме» не ставим. Нужна серия с дымоходом.',
  }
];

export function generateMetadata(): Metadata {
  const seo = getSeo(PATH, {
    title: 'Мангальная зона из металла — от 48 000 ₽ | Реал Беседки',
    description: 'Мангальные зоны и мангалы Реал Беседки: чаша от 48 000 ₽, мангал от 95 000 ₽, зона «Огонь» от 400 000 ₽. Москва и МО.',
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
    name: 'Мангальная зона из металла',
    url: `${site.siteUrl}${PATH}`,
    description: 'Мангальные зоны и мангалы Реал Беседки: чаша от 48 000 ₽, мангал от 95 000 ₽, зона «Огонь» от 400 000 ₽. Москва и МО.',
  };

  return (
    <Container className="page-section">
      <JsonLd data={[pageLd, faqLd]} />
      <Breadcrumbs
        items={[
          { label: 'Главная', href: '/' },
          { label: 'Мангальная зона', href: PATH },
        ]}
      />
      <p className="text-sm font-medium text-accent">От чаши до зоны «Огонь»</p>
      <h1 className="page-title mb-4">Мангальная зона из металла</h1>
      <p className="mb-4 max-w-3xl text-text-muted">
        Мангальная зона — не всегда беседка. В каталоге: костровая чаша от 48 000 ₽, мангал «Лофт» от 95 000 ₽, дымоход в беседку от 165 000 ₽, зоны «Огонь» от 400 000 ₽.
      </p>
      <p className="mb-8 max-w-3xl text-text-muted">
        Если очаг внутри каркаса с кровлей — серия беседок с мангалом от 420 000 ₽.
      </p>

      <h2 className="mb-3 font-heading text-2xl">Линейка</h2>
      <div className="mb-8 overflow-x-auto">
        <table className="w-full min-w-[32rem] text-left text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="py-2 pr-3">Позиция</th>
              <th className="py-2 pr-3">Что это</th>
              <th className="py-2">Цена от</th>
            </tr>
          </thead>
          <tbody className="text-text-muted">
            <tr className="border-b border-border">
              <td className="py-2 pr-3"><Link className="text-accent hover:underline" href="/katalog/mangaly/m-01">M-01 Искра</Link></td>
              <td className="py-2 pr-3">чаша</td>
              <td className="py-2">48 000 ₽</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-3"><Link className="text-accent hover:underline" href="/katalog/mangaly/m-02">M-02 Лофт</Link></td>
              <td className="py-2 pr-3">мангал</td>
              <td className="py-2">95 000 ₽</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-3"><Link className="text-accent hover:underline" href="/katalog/mangaly/m-03">M-03 Дымоход</Link></td>
              <td className="py-2 pr-3">в беседку</td>
              <td className="py-2">165 000 ₽</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-3"><Link className="text-accent hover:underline" href="/katalog/mangaly/m-04">M-04 Очаг</Link></td>
              <td className="py-2 pr-3">барбекю-зона</td>
              <td className="py-2">245 000 ₽</td>
            </tr>
            <tr className="">
              <td className="py-2 pr-3"><Link className="text-accent hover:underline" href="/katalog/mangaly/m-07">M-07 Огонь · Лофт</Link></td>
              <td className="py-2 pr-3">мангальная зона</td>
              <td className="py-2">400 000 ₽</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="mb-3 font-heading text-2xl">Беседка или зона рядом</h2>
      <p className="mb-8 max-w-3xl text-text-muted">
        Огонь внутри — <Link className="text-accent hover:underline" href="/besedka-s-mangalom-pod-klyuch">беседки «Огонь»</Link>. Открытая беседка + чаша рядом — дешевле и проще по дыму.
      </p>

      <p className="mb-8 text-sm">
        <Link className="text-accent hover:underline" href="/katalog/mangaly">
          Каталог мангалов
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/besedka-s-mangalom-pod-klyuch">
          Беседки с мангалом
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/barbekyu-zona">
          Барбекю
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/tseny-na-besedki">
          Цены
        </Link>
      </p>

      <FAQ items={FAQ_ITEMS} />
      <div className="mt-10">
        <h2 className="mb-3 font-heading text-2xl">Оставить заявку</h2>
        <LeadForm context="mangalnaya-zona" />
      </div>
    </Container>
  );
}

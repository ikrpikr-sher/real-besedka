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

const PATH = '/otkrytaya-besedka';

const FAQ_ITEMS = [
  {
    question: 'Открытая беседка продувается?',
    answer:
      'Да, это смысл открытого контура. Ветер снимают панели, торец и опция штор — не стеклопакет.',
  },
  {
    question: 'Сколько стоит открытая под ключ?',
    answer:
      'От 95 000 ₽ за 2×2 без фундамента. Монтаж и сваи — отдельно в смете после замера.',
  },
  {
    question: 'Чем отличается от навеса?',
    answer:
      'У беседки пол, ограждения/панели и посадка под стол. Навес — кровля над авто или террасой: см. страницу /metallicheskiy-naves.',
  }
];

export function generateMetadata(): Metadata {
  const seo = getSeo(PATH, {
    title: 'Открытая беседка из металла — от 95 000 ₽ | Реал Беседки',
    description: 'Открытые металлические беседки Реал Беседки: каркас 80×80×3 мм, пол фанера, металлочерепица. От 95 000 ₽ за 2×2. Москва и МО.',
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
    name: 'Открытая беседка из металла',
    url: `${site.siteUrl}${PATH}`,
    description: 'Открытые металлические беседки Реал Беседки: каркас 80×80×3 мм, пол фанера, металлочерепица. От 95 000 ₽ за 2×2. Москва и МО.',
  };

  return (
    <Container className="page-section">
      <JsonLd data={[pageLd, faqLd]} />
      <Breadcrumbs
        items={[
          { label: 'Главная', href: '/' },
          { label: 'Открытая беседка', href: PATH },
        ]}
      />
      <p className="text-sm font-medium text-accent">Сезон на воздухе без «аквариума»</p>
      <h1 className="page-title mb-4">Открытая беседка из металла</h1>
      <p className="mb-4 max-w-3xl text-text-muted">
        Открытая беседка — каркас, кровля и панели без глухого остекления. Это основной объём каталога «Графит»: от компактной 2×2 «Старт» B-10 за 95 000 ₽ до лазерных 2 м и шестигранников.
      </p>
      <p className="mb-8 max-w-3xl text-text-muted">
        Пол в базе — влагостойкая фанера. ДПК — опция. Шторы и москитные сетки — опции, не «закрытая беседка». Каркас тот же 80×80×3 мм, что потом выдержит стекло, если решите остеклить позже по проекту.
      </p>
      <HubLeadCta note="Открытая серия: размер, панели, смета по Москве и МО." />
      <HubProductPicks
        slugs={['b-10', 'b-17', 'b-11', 'b-42']}
        heading="Открытые модели в каталоге"
        catalogHref="/katalog/otkrytye-besedki"
        catalogLabel="Каталог открытых"
      />

      <h2 className="mb-3 font-heading text-2xl">Линейка открытых</h2>
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
              <td className="py-2 pr-3"><Link className="text-accent hover:underline" href="/katalog/otkrytye-besedki/b-10">B-10 Старт</Link></td>
              <td className="py-2 pr-3">2×2</td>
              <td className="py-2">95 000 ₽</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-3"><Link className="text-accent hover:underline" href="/katalog/otkrytye-besedki/b-19">B-19</Link></td>
              <td className="py-2 pr-3">2×3</td>
              <td className="py-2">175 000 ₽</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-3"><Link className="text-accent hover:underline" href="/katalog/otkrytye-besedki/b-17">B-17</Link></td>
              <td className="py-2 pr-3">3×4</td>
              <td className="py-2">185 000 ₽</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-3"><Link className="text-accent hover:underline" href="/katalog/otkrytye-besedki/b-11">B-11 Богатыри</Link></td>
              <td className="py-2 pr-3">4×4</td>
              <td className="py-2">230 000 ₽</td>
            </tr>
            <tr className="">
              <td className="py-2 pr-3"><Link className="text-accent hover:underline" href="/katalog/otkrytye-besedki/b-12">B-12 Медведи</Link></td>
              <td className="py-2 pr-3">3×3</td>
              <td className="py-2">240 000 ₽</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="mb-3 font-heading text-2xl">Кому хватает открытой</h2>
      <p className="mb-8 max-w-3xl text-text-muted">
        Дача с сезоном май–октябрь, мангал рядом (не внутри), бюджет без стекла. Если нужна комната зимой — сразу смотрите <Link className="text-accent hover:underline" href="/zakrytaya-besedka">закрытую</Link> / <Link className="text-accent hover:underline" href="/zimnyaya-besedka">зимнюю</Link>.
      </p>

      <h2 className="mb-3 font-heading text-2xl">Опции</h2>
      <p className="mb-8 max-w-3xl text-text-muted">
        ДПК вместо фанеры, глухой торец, резная стена, шторы, сетки, скрытая электрика — по карточке модели. Мангал в открытую не встраиваем: рядом чаша или серия «Огонь».
      </p>

      <p className="mb-8 text-sm">
        <Link className="text-accent hover:underline" href="/katalog/otkrytye-besedki">
          Каталог открытых
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/besedka-3x4">
          3×4
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/besedka-4x4">
          4×4
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/zakrytaya-besedka">
          Закрытые
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/tseny-na-besedki">
          Цены
        </Link>
      </p>

      <CommerceHubNav current="/otkrytaya-besedka" />
      <FAQ items={FAQ_ITEMS} />
      <div id="raschet" className="mt-10">
        <h2 className="mb-3 font-heading text-2xl">Оставить заявку</h2>
        <LeadForm context="otkrytaya-besedka" />
      </div>
    </Container>
  );
}

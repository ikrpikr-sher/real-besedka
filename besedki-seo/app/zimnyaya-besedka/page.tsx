import type { Metadata } from 'next';
import Link from 'next/link';
import Container from '@/components/Container';
import Breadcrumbs from '@/components/Breadcrumbs';
import FAQ from '@/components/FAQ';
import JsonLd from '@/components/JsonLd';
import LeadForm from '@/components/LeadForm';
import CommerceHubNav from '@/components/CommerceHubNav';
import HubLeadCta from '@/components/HubLeadCta';
import HubProductPicks, { catalogFromPrice } from '@/components/HubProductPicks';
import { getSeo } from '@/lib/seo';
import { getSite } from '@/lib/content';

const PATH = '/zimnyaya-besedka';

const FAQ_ITEMS = [
  {
    question: 'Чем зимняя беседка отличается от остеклённой?',
    answer:
      'По сути это один класс: стеклопакет на жёстком каркасе. «Зимняя» в запросе чаще означает круглый год; мы ведём на «Панораму» и C8, не на мягкие окна.',
  },
  {
    question: 'Нужно ли отопление?',
    answer:
      'Без утепления и источника тепла зимой будет холоднее, чем в доме. Стеклопакет снимает ветер и сырость плёнки; комфорт «как в гостиной» — опции карточки.',
  },
  {
    question: 'Можно ли открыть летом?',
    answer:
      'Да: раздвижные створки «Панорамы» открывают фасад. Летом это та же беседка с возможностью проветривания.',
  }
];

export function generateMetadata(): Metadata {
  const seo = getSeo(PATH, {
    title: 'Зимняя беседка со стеклопакетом — от 400 000 ₽ | Реал Беседки',
    description: 'Зимняя металлическая беседка «Панорама» и лофт C8: каркас 80×80×3 мм, раздвижные стеклопакеты. От 400 000 ₽ за 3×3. Москва и МО.',
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
    name: 'Зимняя беседка со стеклопакетом',
    url: `${site.siteUrl}${PATH}`,
    description: 'Зимняя металлическая беседка «Панорама» и лофт C8: каркас 80×80×3 мм, раздвижные стеклопакеты. От 400 000 ₽ за 3×3. Москва и МО.',
  };

  return (
    <Container className="page-section">
      <JsonLd data={[pageLd, faqLd]} />
      <Breadcrumbs
        items={[
          { label: 'Главная', href: '/' },
          { label: 'Зимняя беседка', href: PATH },
        ]}
      />
      <p className="text-sm font-medium text-accent">Круглый год, не плёнка на сезон</p>
      <h1 className="page-title mb-4">Зимняя беседка со стеклопакетом</h1>
      <p className="mb-4 max-w-3xl text-text-muted">
        «Зимняя беседка» в поиске — это не шатёр с тентом и не мягкие окна до первых морозов. У нас зимний контур = каркас 80×80×3 мм сразу под стеклопакет. Серия «Панорама» и лофт C8 — цена на карточке модели ниже.
      </p>
      <p className="mb-8 max-w-3xl text-text-muted">
        Лофт C8 с профнастилом — карточки B-54 (3×3) и B-53 (3×4). Мягкие окна как «зиму» не продаём: другой срок службы и другое ощущение внутри.
      </p>

      <h2 className="mb-3 font-heading text-2xl">Что входит в зимний контур</h2>
      <ul className="mb-8 max-w-3xl list-disc space-y-2 pl-5 text-text-muted">
        <li>Стойки и ригеля под стекло на этапе каркаса — не «достройка плёнкой».</li>
        <li>Раздвижные стеклопакеты по фасадам серии «Панорама».</li>
        <li>Пол у «Панорамы» в базе — фанера; ДПК — опция. У открытых серий база тоже фанера.</li>
        <li>Опции: скрытая электрика, утепление крыши, тёплый пол — по карточке модели.</li>
        </ul>
      <HubLeadCta note="Зимний контур: стеклопакет, размер, смета по участку в Москве и МО." />
      <HubProductPicks
        slugs={['b-21', 'b-22', 'b-23', 'b-53']}
        heading="Зимние модели в каталоге"
        catalogHref="/katalog/besedki-s-ostekleniem"
        catalogLabel="Каталог остекления"
      />

      <h2 className="mb-3 font-heading text-2xl">Модели для зимы</h2>
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
              <td className="py-2">{catalogFromPrice('b-21')}</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-3"><Link className="text-accent hover:underline" href="/katalog/besedki-s-ostekleniem/b-22">B-22 Веранда+</Link></td>
              <td className="py-2 pr-3">3×4</td>
              <td className="py-2">{catalogFromPrice('b-22')}</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-3"><Link className="text-accent hover:underline" href="/katalog/besedki-osteklennye-loft/b-54">B-54 Лофт C8</Link></td>
              <td className="py-2 pr-3">3×3</td>
              <td className="py-2">{catalogFromPrice('b-54')}</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-3"><Link className="text-accent hover:underline" href="/katalog/besedki-s-ostekleniem/b-23">B-23 Салон</Link></td>
              <td className="py-2 pr-3">4×4</td>
              <td className="py-2">{catalogFromPrice('b-23')}</td>
            </tr>
            <tr className="">
              <td className="py-2 pr-3"><Link className="text-accent hover:underline" href="/katalog/besedki-osteklennye-loft/b-53">B-53 Лофт C8</Link></td>
              <td className="py-2 pr-3">3×4</td>
              <td className="py-2">{catalogFromPrice('b-53')}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="mb-3 font-heading text-2xl">Основание и инженерия</h2>
      <p className="mb-8 max-w-3xl text-text-muted">
        Зимняя беседка тяжелее открытой. На торфе и высокой воде — плита или длинные сваи по расчёту. Стекло даёт свет и ветрозащиту; «квартиру» без утепления крыши и электрики не обещаем. Разбор конденсата на холодном лофте — в <Link className="text-accent hover:underline" href="/blog/ventilyaciya-holodnogo-lofta-b-63">статье про B-63</Link>.
      </p>

      <p className="mb-8 text-sm">
        <Link className="text-accent hover:underline" href="/osteklennaya-besedka">
          Остеклённые
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/zakrytaya-besedka">
          Закрытые
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/katalog/besedki-s-ostekleniem">
          Каталог Панорама
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/besedka-loft">
          Лофт
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/tseny-na-besedki">
          Цены
        </Link>
      </p>

      <CommerceHubNav current="/zimnyaya-besedka" />
      <FAQ items={FAQ_ITEMS} />
      <div id="raschet" className="mt-10">
        <h2 className="mb-3 font-heading text-2xl">Оставить заявку</h2>
        <LeadForm context="zimnyaya-besedka" />
      </div>
    </Container>
  );
}

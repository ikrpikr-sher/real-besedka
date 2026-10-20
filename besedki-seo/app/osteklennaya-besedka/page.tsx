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

const PATH = '/osteklennaya-besedka';

const FAQ_ITEMS = [
  {
    question: 'Можно ли остеклить уже купленную открытую беседку?',
    answer:
      'Точечно — по запросу. Честнее закладывать стекло на этапе каркаса: стойки, ригеля и притворы считаются сразу. Достройка плёнкой — другой срок службы.',
  },
  {
    question: 'Нужно ли разрешение на остеклённую беседку?',
    answer:
      'Как правило это нежилой объект на участке ИЖС или СНТ. Юридический статус уточняйте в своём посёлке; мы даём спецификацию и габариты для согласования.',
  },
];

export function generateMetadata(): Metadata {
  const seo = getSeo(PATH, {
    title: 'Беседка с остеклением под ключ — Реал Беседки',
    description:
      'Беседка с остеклением под ключ: серия «Панорама» и лофт C8, каркас 80×80×3 мм, раздвижные стеклопакеты, пол фанера в базе. Цена на карточке. Москва и МО.',
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
      images: [{ url: '/images/osteklenie/b-30/06-hero-left.webp', width: 1200, height: 800 }],
    },
  };
}

export default function GlazedPage() {
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
    name: 'Беседка с остеклением под ключ',
    url: `${site.siteUrl}${PATH}`,
    description: 'Металлическая беседка с раздвижным стеклопакетом. Каркас 80×80, пол фанера в базе. Реал Беседки, Москва и МО.',
  };

  return (
    <Container className="page-section">
      <JsonLd data={[pageLd, faqLd]} />
      <Breadcrumbs
        items={[
          { label: 'Главная', href: '/' },
          { label: 'Остеклённая беседка', href: PATH },
        ]}
      />
      <p className="text-sm font-medium text-accent">Комната на участке, не мягкие окна на сезон</p>
      <h1 className="page-title mb-4">Беседка с остеклением под ключ</h1>
      <p className="mb-4 max-w-3xl text-text-muted">
        Металлическая беседка с остеклением под ключ — это стеклопакет на каркасе 80×80×3 мм, не мягкие
        окна. Серия «Панорама» и остеклённый лофт C8 — производство и монтаж в Москве и МО. Цена «от» —
        на карточке модели ниже, без устаревшего ориентира из чужой выдачи.
      </p>
      <p className="mb-8 max-w-3xl text-text-muted">
        Каркас той же жёсткости, что у открытых моделей: на тонкой профтрубе зимний контур не собирают.
        Пол в базе — фанера, ДПК — опция.
      </p>
      <HubLeadCta note="Остекление под ключ: размер, «Панорама» или лофт C8, смета по участку в Москве и МО." />
      <HubProductPicks
        slugs={['b-21', 'b-22', 'b-23', 'b-53']}
        heading="Остеклённые модели в каталоге"
        catalogHref="/katalog/besedki-s-ostekleniem"
        catalogLabel="Каталог остекления"
      />

      <h2 className="mb-3 font-heading text-2xl">Стеклопакет или мягкие окна</h2>
      <div className="mb-8 overflow-x-auto">
        <table className="w-full min-w-[32rem] text-left text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="py-2 pr-3">Критерий</th>
              <th className="py-2 pr-3">Мягкие окна</th>
              <th className="py-2">«Панорама» / C8</th>
            </tr>
          </thead>
          <tbody className="text-text-muted">
            <tr className="border-b border-border">
              <td className="py-2 pr-3">Сезон</td>
              <td className="py-2 pr-3">весна–осень</td>
              <td className="py-2">круглый год</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-3">Каркас</td>
              <td className="py-2 pr-3">открытая серия</td>
              <td className="py-2">тот же 80×80, сразу под стекло</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-3">Цена от</td>
              <td className="py-2 pr-3">открытая + 20–40 тыс.</td>
              <td className="py-2">{catalogFromPrice('b-21')}</td>
            </tr>
            <tr>
              <td className="py-2 pr-3">Вид</td>
              <td className="py-2 pr-3">волны ПВХ</td>
              <td className="py-2">ровный стеклопакет</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="mb-3 font-heading text-2xl">Какую серию брать</h2>
      <p className="mb-8 max-w-3xl text-text-muted">
        «Панорама · Капсула» 3×3 — компактная гостиная.{' '}
        <Link className="text-accent hover:underline" href="/katalog/besedki-s-ostekleniem/b-22">
          «Веранда+» 3×4
        </Link>{' '}
        — стол и проход. «Салон» 4×4 — как комната. C8 — если нужен лофт-фасад с профнастилом, а не
        «аквариум». На холодном лофте конденсат снимает естественный стек, не приточка — разбор на{' '}
        <Link className="text-accent hover:underline" href="/blog/ventilyaciya-holodnogo-lofta-b-63">
          B-63
        </Link>
        .
      </p>

      <h2 className="mb-3 font-heading text-2xl">Основание и инженерия</h2>
      <p className="mb-8 max-w-3xl text-text-muted">
        Остеклённая беседка тяжелее открытой и не любит игру свай. На торфе и высокой воде — плита или
        длинные сваи по расчёту. Скрытая электрика, тёплый пол и утепление крыши — опции карточки, без
        них стекло даёт свет, но не «квартиру».
      </p>

      <p className="mb-8 text-sm">
        <Link className="text-accent hover:underline" href="/katalog/besedki-s-ostekleniem">
          Каталог остекления
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/tseny-na-besedki">
          Цены
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/blog/zimnyaya-besedka-so-steklopaketom-panorama">
          Что входит в «Панораму»
        </Link>
      </p>

      <CommerceHubNav current="/osteklennaya-besedka" />
      <FAQ items={FAQ_ITEMS} />
      <div id="raschet" className="mt-10">
        <h2 className="mb-3 font-heading text-2xl">Оставить заявку</h2>
        <LeadForm context="osteklennaya-besedka" />
      </div>
    </Container>
  );
}

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

const PATH = '/zakrytaya-besedka';

const FAQ_ITEMS = [
  {
    question: 'Закрытая = зимняя?',
    answer:
      'Почти да: закрытый контур у нас на стекле. Разница в формулировке запроса; посадочные ведут в один каталог «Панорама» / C8.',
  },
  {
    question: 'Можно ли закрыть открытую позже?',
    answer:
      'Точечно — по запросу. Честнее закладывать стекло на этапе каркаса: стойки и притворы считаются сразу.',
  },
  {
    question: 'Шторы — это закрытая беседка?',
    answer:
      'Нет. Шторы — опция открытой серии. Закрытая в нашем смысле — стеклопакет.',
  }
];

export function generateMetadata(): Metadata {
  const seo = getSeo(PATH, {
    title: 'Закрытая беседка из металла — от 400 000 ₽ | Реал Беседки',
    description: 'Закрытая металлическая беседка со стеклом: серия «Панорама» от 400 000 ₽, лофт C8 от 480 000 ₽. Каркас 80×80×3 мм. Москва и МО.',
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
    name: 'Закрытая беседка из металла',
    url: `${site.siteUrl}${PATH}`,
    description: 'Закрытая металлическая беседка со стеклом: серия «Панорама» от 400 000 ₽, лофт C8 от 480 000 ₽. Каркас 80×80×3 мм. Москва и МО.',
  };

  return (
    <Container className="page-section">
      <JsonLd data={[pageLd, faqLd]} />
      <Breadcrumbs
        items={[
          { label: 'Главная', href: '/' },
          { label: 'Закрытая беседка', href: PATH },
        ]}
      />
      <p className="text-sm font-medium text-accent">Стекло и стены, не шторы на сезон</p>
      <h1 className="page-title mb-4">Закрытая беседка из металла</h1>
      <p className="mb-4 max-w-3xl text-text-muted">
        «Закрытая беседка» — запрос про защиту от ветра, дождя и зимы. У Реал Беседки закрытый контур = остекление на каркасе 80×80×3 мм. Открытая серия + шторы — это другой класс: сезонная защита, не комната.
      </p>
      <p className="mb-8 max-w-3xl text-text-muted">
        Стартовая закрытая — «Панорама · Капсула» 3×3. Нужен лофт-фасад — C8. Мангал внутри закрытой «Панорамы» не ставим: огонь — серия «Огонь» с дымоходом. Цена — на карточках ниже.
      </p>
      <HubLeadCta note="Закрытый контур со стеклом: размер, серия, смета по Москве и МО." />
      <HubProductPicks
        slugs={['b-21', 'b-22', 'b-23', 'b-53']}
        heading="Закрытые модели в каталоге"
        catalogHref="/katalog/besedki-s-ostekleniem"
        catalogLabel="Каталог остекления"
      />

      <h2 className="mb-3 font-heading text-2xl">Открытая vs закрытая</h2>
      <div className="mb-8 overflow-x-auto">
        <table className="w-full min-w-[32rem] text-left text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="py-2 pr-3">Критерий</th>
              <th className="py-2 pr-3">Открытая</th>
              <th className="py-2">Закрытая</th>
            </tr>
          </thead>
          <tbody className="text-text-muted">
            <tr className="border-b border-border">
              <td className="py-2 pr-3">Сезон</td>
              <td className="py-2 pr-3">весна–осень + шторы</td>
              <td className="py-2">круглый год</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-3">Цена от</td>
              <td className="py-2 pr-3">95 000 ₽</td>
              <td className="py-2">400 000 ₽</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-3">Стены</td>
              <td className="py-2 pr-3">панели / проём</td>
              <td className="py-2">стеклопакет</td>
            </tr>
            <tr className="">
              <td className="py-2 pr-3">Мангал внутри</td>
              <td className="py-2 pr-3">рядом или «Огонь»</td>
              <td className="py-2">только «Огонь» с дымоходом</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="mb-3 font-heading text-2xl">Как выбрать размер закрытой</h2>
      <p className="mb-8 max-w-3xl text-text-muted">
        3×3 «Капсула» — компактная гостиная. 3×4 «Веранда+» — стол и проход. 4×4 «Салон» — как комната. Подробный разбор стекла — на <Link className="text-accent hover:underline" href="/osteklennaya-besedka">остеклённой</Link> и <Link className="text-accent hover:underline" href="/zimnyaya-besedka">зимней</Link> страницах; здесь — развилка «закрыть или оставить открытой».
      </p>

      <h2 className="mb-3 font-heading text-2xl">Когда хватает открытой</h2>
      <p className="mb-8 max-w-3xl text-text-muted">
        Если пользуетесь май–сентябрь и бюджет до 250 тысяч — берите открытую от 95 000 ₽ и опции штор/сеток. Закрывать «на всякий случай» дороже, чем поставить стекло сразу на правильном каркасе.
      </p>

      <p className="mb-8 text-sm">
        <Link className="text-accent hover:underline" href="/otkrytaya-besedka">
          Открытые
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
        <Link className="text-accent hover:underline" href="/katalog/besedki-s-ostekleniem">
          Каталог
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/tseny-na-besedki">
          Цены
        </Link>
      </p>

      <CommerceHubNav current="/zakrytaya-besedka" />
      <FAQ items={FAQ_ITEMS} />
      <div id="raschet" className="mt-10">
        <h2 className="mb-3 font-heading text-2xl">Оставить заявку</h2>
        <LeadForm context="zakrytaya-besedka" />
      </div>
    </Container>
  );
}

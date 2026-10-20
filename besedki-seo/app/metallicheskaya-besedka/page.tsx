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

const PATH = '/metallicheskaya-besedka';

const FAQ_ITEMS = [
  {
    question: 'Металлическая = из металла?',
    answer:
      'Да, это один кластер. Страницы «из металла» и «металлическая» ведут в один оффер завода.',
  },
  {
    question: 'Есть рассрочка?',
    answer:
      'Условия оплаты — на странице контактов и в договоре.',
  }
];

export function generateMetadata(): Metadata {
  const seo = getSeo(PATH, {
    title: 'Металлическая беседка — от 95 000 ₽ | Реал Беседки',
    description: 'Металлическая беседка под ключ: каркас 80×80×3 мм, лазерные панели, порошок. От 95 000 ₽. Производитель в Москве — Реал Беседки.',
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
    name: 'Металлическая беседка',
    url: `${site.siteUrl}${PATH}`,
    description: 'Металлическая беседка под ключ: каркас 80×80×3 мм, лазерные панели, порошок. От 95 000 ₽. Производитель в Москве — Реал Беседки.',
  };

  return (
    <Container className="page-section">
      <JsonLd data={[pageLd, faqLd]} />
      <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Металлическая беседка', href: PATH }]} />
      <p className="text-sm font-medium text-accent">Точный запрос рынка металл-сегмента</p>
      <h1 className="page-title mb-4">Металлическая беседка</h1>
      <p className="mb-4 max-w-3xl text-text-muted">
        «Металлическая беседка» — голова сегмента, где в топе мангал-заводы и ковка. У нас другой продукт: дизайнерская беседка с полом, кровлей и панелями ЧПУ, не жаровня с навесом 2×1,5 м.
      </p>
      <p className="mb-8 max-w-3xl text-text-muted">
        Типовые посадки — 3×3 / 3×4 / 4×4. Под ключ: производство + доставка + монтаж в Москве и МО. Цена модели — на карточке.
      </p>
      <HubLeadCta />
      <HubProductPicks slugs={['b-10', 'b-17', 'b-21', 'bm-11']} heading="Металлические модели" />

      <h2 className="mb-3 font-heading text-2xl">Линейки</h2>
      <div className="mb-8 overflow-x-auto">
        <table className="w-full min-w-[32rem] text-left text-sm">
          <thead><tr className="border-b border-border">
              <th className="py-2 pr-3">Линейка</th>
              <th className="py-2 pr-3">Суть</th>
              <th className="py-2">От</th>
            </tr></thead>
          <tbody className="text-text-muted">
            <tr className="border-b border-border">
              <td className="py-2 pr-3"><Link className="text-accent hover:underline" href="/otkrytaya-besedka">Открытые</Link></td>
              <td className="py-2 pr-3">сезон, панели ЧПУ</td>
              <td className="py-2">95 000 ₽</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-3"><Link className="text-accent hover:underline" href="/osteklennaya-besedka">Остеклённые</Link></td>
              <td className="py-2 pr-3">Панорама / лофт</td>
              <td className="py-2">400 000 ₽</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-3"><Link className="text-accent hover:underline" href="/besedka-s-mangalom-pod-klyuch">С мангалом</Link></td>
              <td className="py-2 pr-3">серия Огонь</td>
              <td className="py-2">420 000 ₽</td>
            </tr>
            <tr className="">
              <td className="py-2 pr-3"><Link className="text-accent hover:underline" href="/besedka-loft">Лофт C8</Link></td>
              <td className="py-2 pr-3">стекло + профнастил</td>
              <td className="py-2">480 000 ₽</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="mb-3 font-heading text-2xl">Почему не 50–70 тысяч как у мангал-магазинов</h2>
      <p className="mb-8 max-w-3xl text-text-muted">
        Там часто каркас+крыша без пола-беседки и без нашего сечения 80×80. Сравнивайте комплект, не только слово «беседка» в title.
      </p>

      <p className="mb-8 text-sm">
        <Link className="text-accent hover:underline" href="/besedka-iz-metalla">
          Из металла
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/kupit-besedku">
          Купить беседку
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/besedka-pod-klyuch">
          Под ключ
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/proizvoditel-besedok">
          Производитель
        </Link>
      </p>

      <CommerceHubNav current="/metallicheskaya-besedka" />
      <FAQ items={FAQ_ITEMS} />
      <div id="raschet" className="mt-10">
        <h2 className="mb-3 font-heading text-2xl">Оставить заявку</h2>
        <LeadForm context="metallicheskaya-besedka" />
      </div>
    </Container>
  );
}

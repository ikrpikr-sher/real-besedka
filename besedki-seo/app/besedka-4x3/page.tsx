import type { Metadata } from 'next';
import Link from 'next/link';
import Container from '@/components/Container';
import Breadcrumbs from '@/components/Breadcrumbs';
import FAQ from '@/components/FAQ';
import JsonLd from '@/components/JsonLd';
import LeadForm from '@/components/LeadForm';
import { getSeo } from '@/lib/seo';
import { getSite } from '@/lib/content';

const PATH = '/besedka-4x3';

const FAQ_ITEMS = [
  {
    question: '4×3 и 3×4 — это одно и то же, только повёрнутое?',
    answer:
      'Площадь 12 м² одинаковая. Открытый фасад разный: у B-13 вход 4 м, у B-17 — 3 м. Поворот «как удобно» ломает уклон кровли и рисунок панелей. На замере фиксируем, какой торец к дому.',
  },
  {
    question: 'Куда ставить стол в беседке 4×3?',
    answer:
      'Вдоль фасада 4 м, к виду. Гости смотрят в лес или газон, а не в торец дома. Если глубина участка узкая и вид с короткой стороны — берите 3×4, не крутите 4×3 на площадке.',
  },
];

export function generateMetadata(): Metadata {
  const seo = getSeo(PATH, {
    title: 'Беседка 4×3 (4 на 3) из металла — Лоси от 270 000 ₽, Олени от 320 000 ₽ | Реал Беседки',
    description:
      'Металлическая беседка 4×3: «Лоси» B-13 от 270 000 ₽, «Олени» B-15 от 320 000 ₽. Фасад 4 м к виду, не путать с 3×4. Каркас 80×80, Москва и МО.',
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
      images: [{ url: '/images/proekty/b-13-1.webp', width: 1200, height: 800 }],
    },
  };
}

export default function Size43Page() {
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
    name: 'Беседка 4×3 из металла',
    url: `${site.siteUrl}${PATH}`,
    description: 'Металлическая беседка 4×3: фасад 4 м, модели B-13 / B-15, отличие от 3×4. Москва и МО.',
  };

  return (
    <Container className="page-section">
      <JsonLd data={[pageLd, faqLd]} />
      <Breadcrumbs
        items={[
          { label: 'Главная', href: '/' },
          { label: 'Беседка 4×3', href: PATH },
        ]}
      />
      <p className="text-sm font-medium text-accent">Фасад 4 м к виду — не перепутать с 3×4</p>
      <h1 className="page-title mb-4">Беседка 4×3 (4 на 3) из металла</h1>
      <p className="mb-4 max-w-3xl text-text-muted">
        4×3 в поиске часто схлопывают с 3×4. У нас это другое пятно: открытый фасад 4,0 м, глубина
        3,0 м. «Графит · Лоси» B-13 — от 270 000 ₽, панели с лосями 1 м. «Графит · Олени» B-15 — от
        320 000 ₽, тот же каркас, другой рез. На 12 м² садятся те же 8–10, но стол ставится вдоль вида,
        а не вдоль дома.
      </p>
      <p className="mb-8 max-w-3xl text-text-muted">
        Деревянные теги 4×3 у конкурентов отдают чертежи односкатки. Мы продаём заводской 80×80, не
        расчёт материала.
      </p>

      <h2 className="mb-3 font-heading text-2xl">Когда 4×3 лучше 3×4</h2>
      <p className="mb-4 max-w-3xl text-text-muted">
        Широкий фасад к лесу или газону, дом стоит близко сзади. На Мытищах и Истре так чаще заказывают,
        чем «классическую» 3×4. Если глубина участка узкая —{' '}
        <Link className="text-accent hover:underline" href="/besedka-3x4">
          3×4
        </Link>
        . Если гости смотрят в сторону, а не в торец — 4×3.
      </p>
      <div className="mb-8 overflow-x-auto">
        <table className="w-full min-w-[32rem] text-left text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="py-2 pr-3">Модель</th>
              <th className="py-2 pr-3">Пятно</th>
              <th className="py-2 pr-3">Панели</th>
              <th className="py-2">Цена от</th>
            </tr>
          </thead>
          <tbody className="text-text-muted">
            <tr className="border-b border-border">
              <td className="py-2 pr-3">
                <Link className="text-accent hover:underline" href="/katalog/otkrytye-besedki/b-13">
                  B-13 Лоси
                </Link>
              </td>
              <td className="py-2 pr-3">4×3×3 м</td>
              <td className="py-2 pr-3">лоси, 1 м</td>
              <td className="py-2">270 000 ₽</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-3">
                <Link className="text-accent hover:underline" href="/katalog/otkrytye-besedki/b-15">
                  B-15 Олени
                </Link>
              </td>
              <td className="py-2 pr-3">4×3×3 м</td>
              <td className="py-2 pr-3">олени, 1 м</td>
              <td className="py-2">320 000 ₽</td>
            </tr>
            <tr>
              <td className="py-2 pr-3">
                <Link className="text-accent hover:underline" href="/katalog/otkrytye-besedki/b-17">
                  B-17 Лофт
                </Link>
              </td>
              <td className="py-2 pr-3">3×4×3 м</td>
              <td className="py-2 pr-3">лофт, 1 м</td>
              <td className="py-2">185 000 ₽</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="mb-3 font-heading text-2xl">Каркас и опции</h2>
      <p className="mb-8 max-w-3xl text-text-muted">
        Стойки 80×80×3 мм, кровля металлочерепица 22°, пол — фанера в базе. ДПК +35 000 ₽, глухой торец
        +30 000, резная стена +20 000. Мангал внутрь 4×3 не встраиваем — рядом M-03 или серия «Огонь»
        большего пятна.
      </p>

      <p className="mb-8 text-sm">
        <Link className="text-accent hover:underline" href="/katalog/razmer/4x3">
          Все модели 4×3 в каталоге
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/besedka-3x4">
          Беседка 3×4
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/besedka-3x3">
          Беседка 3×3
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/tseny-na-besedki">
          Цены
        </Link>
      </p>

      <FAQ items={FAQ_ITEMS} />
      <div className="mt-10">
        <h2 className="mb-3 font-heading text-2xl">Оставить заявку</h2>
        <LeadForm context="besedka-4x3" />
      </div>
    </Container>
  );
}

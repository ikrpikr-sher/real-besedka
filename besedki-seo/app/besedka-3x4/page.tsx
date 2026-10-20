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

const PATH = '/besedka-3x4';

const FAQ_ITEMS = [
  {
    question: '3×4 — это 12 м² пола?',
    answer:
      'Пятно 3×4 = 12 м² в осях. Полезный пол чуть меньше из-за стоек и панелей. У B-17 длина по фасаду 3,0 м, глубина 4,0 м, конёк 3,0 м.',
  },
  {
    question: 'Почему B-17 дешевле B-42 при том же размере?',
    answer:
      'B-17 — панели 1 м. B-42 — лазер 2 м, другой расход стали 3 мм и другой рез. Это не «наценка за имя», а другая комплектация.',
  },
  {
    question: 'Сколько человек садится в беседку 3×4?',
    answer:
      'Стол около 180 см: 8 комфортно, 10 плотно. На 15 человек нужен 4×4 или вынос столов на газон.',
  },
];

export function generateMetadata(): Metadata {
  const seo = getSeo(PATH, {
    title: 'Беседка 3×4 (3 на 4) из металла — от 185 000 ₽, модели и комплектации | Реал Беседки',
    description:
      'Металлическая беседка 3×4: открытая B-17 от 185 000 ₽, лазер 2 м B-42 от 450 000 ₽, остеклённая «Веранда+» от 440 000 ₽. Сколько гостей, что входит, Москва и МО.',
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
      images: [{ url: '/images/proekty/b-17-2.jpg', width: 1200, height: 800 }],
    },
  };
}

export default function Size34Page() {
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
    name: 'Беседка 3×4 из металла',
    url: `${site.siteUrl}${PATH}`,
    description: 'Металлическая беседка 3×4: гости, модели B-17 / B-42 / Веранда+, цена. Москва и МО.',
  };

  return (
    <Container className="page-section">
      <JsonLd data={[pageLd, faqLd]} />
      <Breadcrumbs
        items={[
          { label: 'Главная', href: '/' },
          { label: 'Беседка 3×4', href: PATH },
        ]}
      />
      <p className="text-sm font-medium text-accent">Самый запрашиваемый размер участка МО</p>
      <h1 className="page-title mb-4">Беседка 3×4 (3 на 4) из металла</h1>
      <p className="mb-4 max-w-3xl text-text-muted">
        3×4 м — размер, который чаще всего ищут после «просто беседку». Сюда встаёт стол на 8–10,
        проход за стульями и не чувствуется вагончик. У нас это не одна модель: открытая B-17 (фасад
        3 м, глубина 4 м, панели 1 м) от 185 000 ₽ и соседняя B-42 с лазером 2 м — уже от 450 000 ₽.
        Путать их в смете нельзя.
      </p>
      <p className="mb-8 max-w-3xl text-text-muted">
        Остеклённый контур того же пятна — «Панорама · Веранда+» 3×4 от 440 000 ₽. Лофт C8 3×4 — от
        550 000 ₽. Сетка моделей в каталоге размера — отдельно, здесь разбор посадки и цены.
      </p>
      <HubLeadCta note="3×4 м: открытая, лазер или стекло. Смета по Москве и МО." />
      <HubProductPicks
        slugs={['b-17', 'b-42', 'b-22', 'b-53']}
        heading="Модели 3×4 в каталоге"
        catalogHref="/katalog/razmer/3x4"
        catalogLabel="Все 3×4"
      />

      <h2 className="mb-3 font-heading text-2xl">Сколько человек садится</h2>
      <p className="mb-4 max-w-3xl text-text-muted">
        Стол 180–200 см по длинной стороне — комфортно 8, плотно 10, банкет на 12 уже в проходах. Если
        гости регулярно больше 10, смотрите 4×4. Для двоих и чая 3×4 избыточна — хватит 2×3.
      </p>
      <div className="mb-8 overflow-x-auto">
        <table className="w-full min-w-[32rem] text-left text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="py-2 pr-3">Модель</th>
              <th className="py-2 pr-3">Контур</th>
              <th className="py-2 pr-3">Панели</th>
              <th className="py-2">Цена от</th>
            </tr>
          </thead>
          <tbody className="text-text-muted">
            <tr className="border-b border-border">
              <td className="py-2 pr-3">
                <Link className="text-accent hover:underline" href="/katalog/otkrytye-besedki/b-17">
                  B-17 Графит · Лофт
                </Link>
              </td>
              <td className="py-2 pr-3">открытая 3×4×3 м</td>
              <td className="py-2 pr-3">1 м</td>
              <td className="py-2">185 000 ₽</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-3">B-42 лазер 2 м</td>
              <td className="py-2 pr-3">открытая 3×4</td>
              <td className="py-2 pr-3">2 м</td>
              <td className="py-2">450 000 ₽</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-3">
                <Link className="text-accent hover:underline" href="/katalog/besedki-s-ostekleniem/b-22">
                  B-22 Веранда+
                </Link>
              </td>
              <td className="py-2 pr-3">стекло 3×4×2,5 м</td>
              <td className="py-2 pr-3">зимний контур</td>
              <td className="py-2">440 000 ₽</td>
            </tr>
            <tr>
              <td className="py-2 pr-3">
                <Link className="text-accent hover:underline" href="/katalog/besedki-osteklennye-loft/b-53">
                  B-53 Лофт C8
                </Link>
              </td>
              <td className="py-2 pr-3">стекло + С8 3×4</td>
              <td className="py-2 pr-3">лофт-фасад</td>
              <td className="py-2">550 000 ₽</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="mb-3 font-heading text-2xl">Посадка на участке</h2>
      <p className="mb-8 max-w-3xl text-text-muted">
        Фасад 3 м ставим к виду, глубину 4 м — к дому или к мангалу. От забора в МО часто просят 1–3 м
        по уставу СНТ: проверяйте свой. Каркас 80×80×3 мм, кровля металлочерепица, монтаж на сваи или
        плиту за день после готовности основания.
      </p>

      <h2 className="mb-3 font-heading text-2xl">Опции именно на 3×4</h2>
      <p className="mb-8 max-w-3xl text-text-muted">
        На B-17 в базе нет стен, пол — фанера. ДПК +35 000 ₽, глухой торец +30 000, резная стена
        +20 000, шторы +20 000, москитные сетки +14 000, скрытая электрика +20 000. Мангал в B-17 не
        встроен: рядом отдельная чаша. Если очаг внутри — серия «Огонь».
      </p>

      <p className="mb-8 text-sm">
        <Link className="text-accent hover:underline" href="/katalog/razmer/3x4">
          Все модели 3×4 в каталоге
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/besedka-3x3">
          3×3
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/besedka-4x3">
          4×3
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/besedka-4x4">
          4×4
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/besedka-2x3">
          2×3
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/tseny-na-besedki">
          Цены
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/besedka-loft">
          Лофт
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/blog/besedka-3x4-razmer-modeli">
          Статья про 3×4
        </Link>
      </p>

      <CommerceHubNav current="/besedka-3x4" />
      <FAQ items={FAQ_ITEMS} />
      <div id="raschet" className="mt-10">
        <h2 className="mb-3 font-heading text-2xl">Оставить заявку</h2>
        <LeadForm context="besedka-3x4" />
      </div>
    </Container>
  );
}

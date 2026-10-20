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

const PATH = '/besedka-3x3';

const FAQ_ITEMS = [
  {
    question: 'Почему металлическая 3×3 дороже деревянной?',
    answer:
      'ЧПУ по стали 3 мм, пескоструй, порошок в камере, болтовой каркас 80×80. Дерево 130–180 тысяч — пиломатериал и сезонная краска. За 10 лет владения металл часто выходит спокойнее, но входной чек выше — это честно.',
  },
  {
    question: 'Сколько человек садится в беседку 3×3?',
    answer:
      'На 9 м² комфортно 4–6. Стол на 8 уже в проходах. Если раз в месяц приезжает компания из 10 — сразу 3×4. Шашлык внутри тесен: очаг снаружи или серия «Огонь» большего пятна.',
  },
];

export function generateMetadata(): Metadata {
  const seo = getSeo(PATH, {
    title: 'Беседка 3×3 (3 на 3) из металла — от 240 000 ₽, Медведи и Капсула | Реал Беседки',
    description:
      'Металлическая беседка 3×3: «Медведи» B-12 от 240 000 ₽, «Дамаск» B-41 от 380 000 ₽, остеклённая «Капсула» B-21 от 400 000 ₽. Каркас 80×80, Москва и МО.',
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
      images: [{ url: '/images/proekty/b-12-1.webp', width: 1200, height: 800 }],
    },
  };
}

export default function Size33Page() {
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
    name: 'Беседка 3×3 из металла',
    url: `${site.siteUrl}${PATH}`,
    description: 'Металлическая беседка 3×3: гости, модели B-12 / B-41 / B-21, цена. Москва и МО.',
  };

  return (
    <Container className="page-section">
      <JsonLd data={[pageLd, faqLd]} />
      <Breadcrumbs
        items={[
          { label: 'Главная', href: '/' },
          { label: 'Беседка 3×3', href: PATH },
        ]}
      />
      <p className="text-sm font-medium text-accent">Классика поиска — не путать со срубом за 150 тысяч</p>
      <h1 className="page-title mb-4">Беседка 3×3 (3 на 3) из металла</h1>
      <p className="mb-4 max-w-3xl text-text-muted">
        3×3 в выдаче — почти всегда дерево. Наша 3×3 начинается не с 130 тысяч: открытая «Графит ·
        Медведи» B-12 — от 240 000 ₽ за каркас с панелями ЧПУ. «Дамаск» B-41 — от 380 000 ₽ (лазер
        2 м). Зимняя «Панорама · Капсула» B-21 — от 400 000 ₽. Это другой продукт, и цена это
        показывает сразу.
      </p>
      <p className="mb-8 max-w-3xl text-text-muted">
        На 9 м² садятся 4–6 человек без танцев. Для шашлыка внутри тесно — очаг лучше снаружи или
        берите серию «Огонь» большего пятна.
      </p>

      <h2 className="mb-3 font-heading text-2xl">Кому хватает трёхнатрёх</h2>
      <p className="mb-4 max-w-3xl text-text-muted">
        Пара, двое детей, чай, узкий участок 6 соток в Королёве или Химках. Квадрат проще поставить в
        угол у забора, чем прямоугольник. Если гости регулярно больше шести — смотрите{' '}
        <Link className="text-accent hover:underline" href="/besedka-3x4">
          3×4
        </Link>
        .
      </p>
      <div className="mb-8 overflow-x-auto">
        <table className="w-full min-w-[32rem] text-left text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="py-2 pr-3">Модель</th>
              <th className="py-2 pr-3">Характер</th>
              <th className="py-2">Цена от</th>
            </tr>
          </thead>
          <tbody className="text-text-muted">
            <tr className="border-b border-border">
              <td className="py-2 pr-3">
                <Link className="text-accent hover:underline" href="/katalog/otkrytye-besedki/b-12">
                  B-12 Медведи 3×3×2,7 м
                </Link>
              </td>
              <td className="py-2 pr-3">открытая, узор лес</td>
              <td className="py-2">240 000 ₽</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-3">
                <Link className="text-accent hover:underline" href="/katalog/otkrytye-besedki/b-41">
                  B-41 Дамаск 3×3×2,5 м
                </Link>
              </td>
              <td className="py-2 pr-3">открытая, лазер 2 м</td>
              <td className="py-2">380 000 ₽</td>
            </tr>
            <tr>
              <td className="py-2 pr-3">
                <Link className="text-accent hover:underline" href="/katalog/besedki-s-ostekleniem/b-21">
                  B-21 Капсула 3×3×2,5 м
                </Link>
              </td>
              <td className="py-2 pr-3">стеклопакеты</td>
              <td className="py-2">400 000 ₽</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="mb-3 font-heading text-2xl">Каркас и пол</h2>
      <p className="mb-8 max-w-3xl text-text-muted">
        Стойки 80×80×3 мм — тот же узел, что на 3×4: не «облегчёнка для маленькой». Пол открытых —
        фанера в базе. На 3×3 экономить сечением бессмысленно: выигрыш в металле копеечный, проигрыш в
        жёсткости — нет.
      </p>

      <p className="mb-8 text-sm">
        <Link className="text-accent hover:underline" href="/katalog/razmer/3x3">
          Все модели 3×3 в каталоге
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/besedka-3x4">
          Беседка 3×4
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/besedka-4x3">
          Беседка 4×3
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/tseny-na-besedki">
          Цены
        </Link>
      </p>

      <CommerceHubNav current="/besedka-3x3" />
      <FAQ items={FAQ_ITEMS} />
      <div className="mt-10">
        <h2 className="mb-3 font-heading text-2xl">Оставить заявку</h2>
        <LeadForm context="besedka-3x3" />
      </div>
    </Container>
  );
}

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

const PATH = '/tseny-na-besedki';

const FAQ_ITEMS = [
  {
    question: 'Цена на сайте — с монтажом?',
    answer:
      'Базовая цена карточки — изделие. Монтаж и основание считаем после замера: сваи, плита или готовый фундамент заказчика. На типовой открытой 3×4 сборка каркаса — один день.',
  },
  {
    question: 'Подорожает ли металл к моменту договора?',
    answer:
      'Фиксируем спецификацию и сумму в договоре. Пока нет договора, ориентир — актуальный ценник карточки.',
  },
  {
    question: 'Можно ли убрать панели и пол, чтобы выйти в бюджет?',
    answer:
      'Да, конфигуратор на карточке это показывает. Но «голый каркас» хуже выглядит на участке — честнее выбрать меньший размер, чем выкинуть пол.',
  },
];

export function generateMetadata(): Metadata {
  const seo = getSeo(PATH, {
    title: 'Цены на металлические беседки в Москве — от 95 000 ₽ | Реал Беседки',
    description:
      'Сколько стоит металлическая беседка под ключ: открытые от 95 000 ₽, остеклённые от 400 000 ₽, с мангалом от 420 000 ₽. Что входит в цену, опции ДПК и стекла.',
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
      images: [{ url: '/images/proekty/b-17-3.jpg', width: 1200, height: 800 }],
    },
  };
}

export default function PricesPage() {
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
    name: 'Цены на металлические беседки',
    url: `${site.siteUrl}${PATH}`,
    description: 'Сетка цен Реал Беседки: открытые, остеклённые, лофт и мангал. Москва и МО.',
  };

  return (
    <Container className="page-section">
      <JsonLd data={[pageLd, faqLd]} />
      <Breadcrumbs
        items={[
          { label: 'Главная', href: '/' },
          { label: 'Цены на беседки', href: PATH },
        ]}
      />
      <p className="text-sm font-medium text-accent">Август 2026 · цены «от» на каркас в базе</p>
      <h1 className="page-title mb-4">Цены на металлические беседки</h1>
      <p className="mb-4 max-w-3xl text-text-muted">
        Цена на сайте — стартовая стоимость каркаса в базовой комплектации, не «от нуля за квадрат».
        Открытая 2×2 начинается от 95 000 ₽, хит 3×4 — от 185 000 ₽, остеклённая «Панорама» — от
        400 000 ₽. Итог на участке зависит от основания, пола, стен и электрики.
      </p>
      <p className="mb-8 max-w-3xl text-text-muted">
        Ниже — сетка по типам, чтобы не сравнивать наш лофт с шатром или с деревянной «трёхнатрёх» без
        учёта владения.
      </p>

      <h2 className="mb-3 font-heading text-2xl">Сетка цен по типам</h2>
      <p className="mb-4 max-w-3xl text-text-muted">
        Цифры — ориентир «от» для Москвы и МО. Точный расчёт после замера: грунт, длина свай, точка
        электричества, вылет кровли.
      </p>
      <div className="mb-8 overflow-x-auto">
        <table className="w-full min-w-[36rem] text-left text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="py-2 pr-3">Тип</th>
              <th className="py-2 pr-3">Размеры</th>
              <th className="py-2 pr-3">Цена от</th>
              <th className="py-2">Что в базе</th>
            </tr>
          </thead>
          <tbody className="text-text-muted">
            <tr className="border-b border-border">
              <td className="py-2 pr-3">
                <Link className="text-accent hover:underline" href="/katalog/otkrytye-besedki">
                  Открытые «Графит»
                </Link>
                , панели 1 м
              </td>
              <td className="py-2 pr-3">2×2 … 6×3</td>
              <td className="py-2 pr-3">95 000 ₽</td>
              <td className="py-2">Каркас, металлочерепица, фанера, панели ЧПУ</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-3">Открытые лазер 2 м</td>
              <td className="py-2 pr-3">3×3 … 8×5</td>
              <td className="py-2 pr-3">380 000 ₽</td>
              <td className="py-2">Выше панели, другой силуэт и чек</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-3">
                <Link className="text-accent hover:underline" href="/katalog/besedki-s-ostekleniem">
                  «Панорама»
                </Link>{' '}
                со стеклопакетами
              </td>
              <td className="py-2 pr-3">3×3 … 4×4</td>
              <td className="py-2 pr-3">400 000 ₽</td>
              <td className="py-2">Зимний контур, пол ДПК в базе у серии</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-3">
                <Link className="text-accent hover:underline" href="/katalog/besedki-osteklennye-loft">
                  Остеклённый лофт C8
                </Link>
              </td>
              <td className="py-2 pr-3">3×4 и соседние</td>
              <td className="py-2 pr-3">550 000 ₽</td>
              <td className="py-2">Стекло, профнастил С8, рейка под дуб</td>
            </tr>
            <tr>
              <td className="py-2 pr-3">
                <Link className="text-accent hover:underline" href="/katalog/besedki-s-mangalom">
                  «Огонь»
                </Link>{' '}
                с мангалом
              </td>
              <td className="py-2 pr-3">3×2 … 6×5</td>
              <td className="py-2 pr-3">420 000 ₽</td>
              <td className="py-2">Жаровня / печь под казан, дымоход</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="mb-3 font-heading text-2xl">Что чаще всего добавляет чек</h2>
      <p className="mb-4 max-w-3xl text-text-muted">
        На карточке{' '}
        <Link className="text-accent hover:underline" href="/katalog/otkrytye-besedki/b-17">
          B-17
        </Link>{' '}
        (3×4, от 185 000 ₽) типичные опции: ДПК +35 000, лиственница +40 000, глухая торцевая стена
        +30 000, шторы +20 000, скрытая электрика +20 000. Стеклопакеты на открытую серию — чаще
        логичнее сразу «Панорама».
      </p>
      <ul className="mb-8 max-w-3xl list-disc space-y-2 pl-5 text-text-muted">
        <li>Винтовые сваи — отдельной сметой по длине и количеству, грунт МО разный.</li>
        <li>Выезд инженера по Москве и области входит в цикл «под ключ».</li>
        <li>Юрлица: НДС 22% или без НДС — фиксируем в договоре.</li>
      </ul>

      <h2 className="mb-3 font-heading text-2xl">Почему «дешевле в объявлении» — другой продукт</h2>
      <p className="mb-8 max-w-3xl text-text-muted">
        Объявления «беседка 3×4 от 80 тысяч» — тент, тонкий профиль 40×20 или каркас без пола и без
        окраски в камере. Стойка 80×80×3 мм, пескоструй и ЧПУ по стали 3 мм в эту вилку не помещаются.
      </p>

      <p className="mb-8 text-sm">
        <Link className="text-accent hover:underline" href="/kupit-metallicheskuyu-besedku">
          Купить металлическую беседку
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/besedka-3x4">
          Беседка 3×4
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/osteklennaya-besedka">
          Остекление
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/blog/skolko-stoit-metallicheskaya-besedka-pod-klyuch">
          Разбор цены в блоге
        </Link>
      </p>

      <CommerceHubNav current="/tseny-na-besedki" />
      <FAQ items={FAQ_ITEMS} />
      <div className="mt-10">
        <h2 className="mb-3 font-heading text-2xl">Оставить заявку</h2>
        <LeadForm context="tseny-na-besedki" />
      </div>
    </Container>
  );
}

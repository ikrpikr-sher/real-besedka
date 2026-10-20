import type { Metadata } from 'next';
import Link from 'next/link';
import Container from '@/components/Container';
import Breadcrumbs from '@/components/Breadcrumbs';
import FAQ from '@/components/FAQ';
import JsonLd from '@/components/JsonLd';
import LeadForm from '@/components/LeadForm';
import { getSeo } from '@/lib/seo';
import { getSite } from '@/lib/content';

const PATH = '/regiony';

const FAQ_ITEMS = [
  {
    question: 'Есть ли доплата за километраж?',
    answer:
      'Логистика внутри МО входит в цикл под ключ в разумном радиусе от Москвы. Дальние точки (за Дмитров, за Серпухов) считаем отдельно на заявке — без сюрприза в день монтажа.',
  },
  {
    question: 'Пришлёте беседку транспортной по России?',
    answer:
      'Разборный комплект отгрузить можно. Сваи и сборку без замера не обещаем. Чужие города без выезда бригады не закрываем отдельными страницами.',
  },
];

export function generateMetadata(): Metadata {
  const seo = getSeo(PATH, {
    title: 'Металлические беседки в Москве и МО — доставка и монтаж | Реал Беседки',
    description:
      'Монтаж металлических беседок в Химках, Одинцово, Красногорске, Мытищах, Подольске, Балашихе, Истре и Королёве. Завод на Складочной, 3с3. Каркас 80×80, замер и сборка за день.',
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
      images: [{ url: '/images/hero-besedka.webp', width: 1200, height: 630 }],
    },
  };
}

export default function RegionsPage() {
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
    name: 'Беседки в Москве и Московской области',
    url: `${site.siteUrl}${PATH}`,
    description: 'География монтажа Реал Беседки: грунт, трасса и типичный размер по городам МО.',
  };

  return (
    <Container className="page-section">
      <JsonLd data={[pageLd, faqLd]} />
      <Breadcrumbs
        items={[
          { label: 'Главная', href: '/' },
          { label: 'Москва и МО', href: PATH },
        ]}
      />
      <p className="text-sm font-medium text-accent">Замер и сборка, не «доставка ТК по РФ»</p>
      <h1 className="page-title mb-4">Беседки в Москве и Московской области</h1>
      <p className="mb-4 max-w-3xl text-text-muted">
        Работаем от склада на Складочной, 3с3. Это замер, сваи и сборка на участке. Ниже — города, где
        ставим чаще: у каждого своя трасса, грунт и размер. Отдельная страница — только если есть
        грунт и логистика, не «беседки + город» из трёх строк.
      </p>
      <p className="mb-8 text-sm">
        <Link className="text-accent hover:underline" href="/regiony/himki">
          Химки
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/regiony/odincovo">
          Одинцово
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/regiony/krasnogorsk">
          Красногорск
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/regiony/mytishchi">
          Мытищи
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/regiony/podolsk">
          Подольск
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/regiony/balashiha">
          Балашиха
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/regiony/istra">
          Истра
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/regiony/korolev">
          Королёв
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/regiony/lyubertsy">
          Люберцы
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/regiony/dolgoprudny">
          Долгопрудный
        </Link>
      </p>

      <h2 className="mb-3 font-heading text-2xl">Химки — Ленинградка, Новогорск, Сходня</h2>
      <p className="mb-8 max-w-3xl text-text-muted">
        Короткая логистика по ТТК и Ленинградке. Участки часто 6–8 соток, таунхаус с патио 4 м — сюда
        не встаёт 4×4. Типичный заказ: открытая 2×3 от 175 000 ₽ или 3×3. Ближе к каналу — высокая
        вода, короткие сваи играют. На песке Подрезково сваи спокойнее.
      </p>

      <h2 className="mb-3 font-heading text-2xl">Одинцово — Барвиха, Жуковка, Можайка</h2>
      <p className="mb-8 max-w-3xl text-text-muted">
        Беседка видна с террасы и не должна выглядеть «дачной». Чаще, чем в Химках, берут остекление и
        лофт C8. На обычных участках города остаётся хит{' '}
        <Link className="text-accent hover:underline" href="/besedka-3x4">
          3×4 B-17
        </Link>
        . В низинах к реке — торф: плита или длинные сваи, не «четыре коротыша из каталога».
      </p>

      <h2 className="mb-3 font-heading text-2xl">Красногорск — Павшино, Опалиха, М-9</h2>
      <p className="mb-8 max-w-3xl text-text-muted">
        Павшинская пойма — постоянный ветер. Доля остекления выше среднего: не статус, а климат.
        Опалиха — обычные 6–10 соток и 3×4. Дворы Павшино с низкими арками: комплект иногда разгружаем
        с улицы, это на замере, не в день «мы уже выехали».
      </p>

      <h2 className="mb-3 font-heading text-2xl">Мытищи — Пироговка, Вешки, Ярославка</h2>
      <p className="mb-8 max-w-3xl text-text-muted">
        Сосновые участки: графит смотрится спокойно, панели «медведи» и «лоси» заказывают без иронии.
        Пески и супеси — сваи ровнее, чем на глине Подольска. Не двигаем сосны на глазок: кроны и
        капель фиксируем на замере.
      </p>

      <h2 className="mb-3 font-heading text-2xl">Подольск — глина, Климовск, мангал</h2>
      <p className="mb-8 max-w-3xl text-text-muted">
        Юг МО — культура шашлыка сильнее «зимней гостиной». Доля серии «Огонь» и связки открытая 3×4 +
        мангал. Глина и пучение: короткая свая «как у соседа» весной даёт щель в панелях ЧПУ. Считаем
        длину и ростверк.
      </p>

      <h2 className="mb-3 font-heading text-2xl">Балашиха — Щёлковское, приватность</h2>
      <p className="mb-8 max-w-3xl text-text-muted">
        Участки ближе, чем на Истре. Открытая беседка часто смотрит в окна соседа — выше запрос на
        глухой торец, шторы и стекло не из зимы, а из приватности. Железнодорожный и Новокосино —
        компакт 3×3 / 3×4.
      </p>

      <h2 className="mb-3 font-heading text-2xl">Истра — Новая Рига, склон, КП</h2>
      <p className="mb-8 max-w-3xl text-text-muted">
        Беседку согласовывает архитектор поселка. Панели 1 м на фоне большого дома теряются — сразу
        лазер, C8 или 4×4 со стеклом. Рельеф: разновысокие сваи, не «горизонт на глаз». Пропуска КП
        за сутки. Отдельная страница —{' '}
        <Link className="text-accent hover:underline" href="/regiony/istra">
          Истра и Новая Рига
        </Link>
        .
      </p>

      <h2 className="mb-3 font-heading text-2xl">Королёв — 4–6 соток, 2×3, шестигранник</h2>
      <p className="mb-8 max-w-3xl text-text-muted">
        Городская нарезка: 3×4 часто не проходит по отступу. Берут 2×3 от 175 000 ₽ или шестигранник
        2,5 м. Разгрузка секциями по узким улицам — норма. Юбилейный и Подлипки — тот же габарит плюс
        УК.{' '}
        <Link className="text-accent hover:underline" href="/regiony/korolev">
          Королёв
        </Link>
        .
      </p>

      <h2 className="mb-3 font-heading text-2xl">Что не делаем удалённо</h2>
      <p className="mb-8 max-w-3xl text-text-muted">
        Не отправляем беседку ТК без замера, если нужны сваи. Не ставим на чужой «уже закрученный»
        фундамент вслепую: сначала геометрия и шаг свай под каркас 80×80. Раменское, Домодедово,
        Люберцы — тот же цикл, отдельные страницы откроем, когда будет свой грунт, не копия.
      </p>

      <p className="mb-8 text-sm">
        <Link className="text-accent hover:underline" href="/kupit-metallicheskuyu-besedku">
          Купить
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/tseny-na-besedki">
          Цены
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/faq">
          Вопросы
        </Link>
      </p>

      <FAQ items={FAQ_ITEMS} />
      <div className="mt-10">
        <h2 className="mb-3 font-heading text-2xl">Оставить заявку</h2>
        <LeadForm context="regiony" />
      </div>
    </Container>
  );
}

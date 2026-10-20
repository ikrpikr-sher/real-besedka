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

const PATH = '/kupit-metallicheskuyu-besedku';

const FAQ_ITEMS = [
  {
    question: 'Можно ли купить беседку без монтажа?',
    answer:
      'Да, отгружаем разборный комплект. Болтовая схема рассчитана на сборку по инструкции, но на участке в МО чаще ставим сами — так сохраняется геометрия каркаса и гарантия на покрытие.',
  },
  {
    question: 'Сколько ждать после оплаты?',
    answer:
      'Изготовление от 7 дней на типовую модель из каталога. Индивидуальный узор на панелях и нестандартный размер добавляют время на ЧПУ и окраску.',
  },
  {
    question: 'Есть ли рассрочка или работа с юрлицами?',
    answer:
      'Физлица — перевод на расчётный счёт ООО «Пулман», наличные или карта через терминал. Юрлица — счёт, акт, НДС по схеме договора.',
  },
  {
    question: 'Это та же компания, что Пулман?',
    answer:
      'Да. «Реал Беседки» — бренд производителя ООО «Пулман». В договоре и на сайте указаны оба имени, чтобы не путать с одноимёнными перекупами и отелем Pullman.',
  },
];

export function generateMetadata(): Metadata {
  const seo = getSeo(PATH, {
    title: 'Купить металлическую беседку в Москве — от 95 000 ₽ | Реал Беседки',
    description:
      'Купить металлическую беседку у производителя Реал Беседки: каркас 80×80×3 мм, металлочерепица, пол фанера, панели ЧПУ. Каталог, цены, монтаж в Москве и МО.',
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

export default function BuyMetalGazeboPage() {
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
    name: 'Купить металлическую беседку в Москве и МО',
    url: `${site.siteUrl}${PATH}`,
    description:
      'Металлические беседки от производителя ООО «Пулман»: каркас 80×80×3 мм, монтаж в Москве и МО.',
  };

  return (
    <Container className="page-section">
      <JsonLd data={[pageLd, faqLd]} />
      <Breadcrumbs
        items={[
          { label: 'Главная', href: '/' },
          { label: 'Купить металлическую беседку', href: PATH },
        ]}
      />
      <p className="text-sm font-medium text-accent">Производитель, не шатёр и не перекуп</p>
      <h1 className="page-title mb-4">Купить металлическую беседку в Москве и МО</h1>
      <p className="mb-4 max-w-3xl text-text-muted">
        «Купить беседку» в поиске смешивает шатры за 15 тысяч, сварные парковые павильоны и капитальные
        конструкции под ключ. Реал Беседки — заводской каркас 80×80×3 мм на болтах, кровля из
        металлочерепицы, пол из влагостойкой фанеры в базе и резные панели из стали 3 мм с ЧПУ. Не
        поликарбонат на тонкой трубе и не сруб, который красят каждый сезон.
      </p>
      <p className="mb-8 max-w-3xl text-text-muted">
        Заказ идёт напрямую с производства ООО «Пулман» (Складочная, 3с3): проект, ЧПУ, пескоструй,
        порошок, доставка разборного комплекта и сборка на участке за 1 день. Изготовление от 7 дней.
        Срок службы более 10 лет. Цену конкретной модели смотрите на карточке.
      </p>
      <HubLeadCta />
      <HubProductPicks slugs={['b-17', 'b-21', 'b-53', 'bm-11']} heading="Модели к покупке" />

      <h2 className="mb-3 font-heading text-2xl">Что входит в покупку</h2>
      <ul className="mb-8 max-w-3xl list-disc space-y-2 pl-5 text-text-muted">
        <li>Стойки 80×80×3 мм, обвязка 40×40×2 мм, болтовые соединения — комплект едет разобранным.</li>
        <li>Пескоструй, цинкосодержащий грунт и порошковая краска. Типовой цвет открытых серий — графит RAL 7016.</li>
        <li>Монтаж на винтовые сваи, плиту или ленту — выбираем по грунту на замере.</li>
        <li>Субподряда на сборке нет: ставит наша бригада.</li>
      </ul>

      <h2 className="mb-3 font-heading text-2xl">Какой тип взять, если ещё не смотрели каталог</h2>
      <div className="mb-8 overflow-x-auto">
        <table className="w-full min-w-[32rem] text-left text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="py-2 pr-3">Задача</th>
              <th className="py-2 pr-3">Тип</th>
              <th className="py-2">Ориентир цены</th>
            </tr>
          </thead>
          <tbody className="text-text-muted">
            <tr className="border-b border-border">
              <td className="py-2 pr-3">Компактный каркас 2×2</td>
              <td className="py-2 pr-3">
                Открытая «Старт»{' '}
                <Link className="text-accent hover:underline" href="/katalog/otkrytye-besedki/b-10">
                  B-10
                </Link>
              </td>
              <td className="py-2">от 95 000 ₽</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-3">Хит 3×4, гости и стол</td>
              <td className="py-2 pr-3">
                Открытая{' '}
                <Link className="text-accent hover:underline" href="/katalog/otkrytye-besedki/b-17">
                  B-17
                </Link>
                {' / '}
                <Link className="text-accent hover:underline" href="/katalog/razmer/3x4">
                  все 3×4
                </Link>
              </td>
              <td className="py-2">от 185 000 ₽</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-3">Круглый год</td>
              <td className="py-2 pr-3">
                <Link className="text-accent hover:underline" href="/katalog/besedki-s-ostekleniem">
                  «Панорама»
                </Link>
              </td>
              <td className="py-2">от 400 000 ₽</td>
            </tr>
            <tr>
              <td className="py-2 pr-3">Шашлык внутри</td>
              <td className="py-2 pr-3">
                <Link className="text-accent hover:underline" href="/katalog/besedki-s-mangalom">
                  «Огонь»
                </Link>
              </td>
              <td className="py-2">от 420 000 ₽</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="mb-3 font-heading text-2xl">Почему не «как у соседа за 130 тысяч из дерева»</h2>
      <p className="mb-8 max-w-3xl text-text-muted">
        Деревянная трёхнатрёх в коридоре 130–180 тысяч — другой рынок: вы покупаете материал, который нужно
        обслуживать. Металл с порошком не обещает ту же цену. Зато нет ежегодной перекраски стоек, каркас
        держит стеклопакет, панели ЧПУ не вырезают ручным шаблоном. Если нужен именно сруб — мы его не
        имитируем.
      </p>

      <h2 className="mb-3 font-heading text-2xl">Как проходит покупка</h2>
      <p className="mb-8 max-w-3xl text-text-muted">
        Заявка или звонок → консультация по размеру и серии → выезд инженера по Москве и МО → договор и срок
        в производстве → доставка и сборка за день → сдача. Для юрлиц — счёт с НДС или без НДС по схеме
        договора.
      </p>

      <p className="mb-8 text-sm">
        <Link className="text-accent hover:underline" href="/katalog">
          Каталог
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/besedka-3x4">
          Беседка 3×4
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
        <Link className="text-accent hover:underline" href="/kontakty">
          Контакты и расчёт
        </Link>
      </p>

      <CommerceHubNav current="/kupit-metallicheskuyu-besedku" />
      <FAQ items={FAQ_ITEMS} />

      <div id="raschet" className="mt-10">
        <h2 className="mb-3 font-heading text-2xl">Оставить заявку</h2>
        <LeadForm context="kupit-metallicheskuyu-besedku" />
      </div>
    </Container>
  );
}

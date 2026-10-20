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

const PATH = '/besedka-s-mangalom-pod-klyuch';

const FAQ_ITEMS = [
  {
    question: 'Можно ли встроить мангал в уже заказанную B-17?',
    answer:
      'В каркас B-17 мангал не встроен — к ней берут M-03 с дымоходом рядом. Врезка «как в Огонь» — другая серия и другой расчёт кровли.',
  },
  {
    question: 'Нужен ли фундамент толще, чем у открытой?',
    answer:
      'Точка очага и труба дают локальную нагрузку. Чаще те же сваи или плита, но раскладку свай согласуем с инженером, не копируем схему открытой 3×4 один в один.',
  },
];

export function generateMetadata(): Metadata {
  const seo = getSeo(PATH, {
    title: 'Беседка с мангалом под ключ — серия «Огонь» от 420 000 ₽ | Реал Беседки',
    description:
      'Металлические беседки с мангалом «Огонь»: жаровня и печь под казан, дымоход, каркас 80×80×3 мм, пол ДПК. 10 моделей от 3×2 до 6×5 м, от 420 000 ₽. Москва и МО.',
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
      images: [{ url: '/images/besedki-s-mangalom/bm-12/01_hero.jpg', width: 1200, height: 800 }],
    },
  };
}

export default function MangalHubPage() {
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
    name: 'Беседки с мангалом под ключ',
    url: `${site.siteUrl}${PATH}`,
    description: 'Серия «Огонь»: очаг внутри контура, дымоход, каркас 80×80. Реал Беседки, Москва и МО.',
  };

  return (
    <Container className="page-section">
      <JsonLd data={[pageLd, faqLd]} />
      <Breadcrumbs
        items={[
          { label: 'Главная', href: '/' },
          { label: 'Беседка с мангалом', href: PATH },
        ]}
      />
      <p className="text-sm font-medium text-accent">Очаг внутри контура, не мангал «рядом на траве»</p>
      <h1 className="page-title mb-4">Беседки с мангалом под ключ</h1>
      <p className="mb-4 max-w-3xl text-text-muted">
        Если шашлык — центр участка, открытая «Графит» плюс мангал M-03 сбоку работает. Если очаг должен
        быть внутри, под кровлей, с дымоходом и без дыма в лицо гостям — серия «Огонь» BM-32…BM-48.
        Десять моделей от 3×2 до 6×5 м, от 420 000 ₽.
      </p>
      <p className="mb-8 max-w-3xl text-text-muted">
        Каркас тот же заводской: 80×80×3 мм, пескоструй, порошок. Мангал не «приварили к столбу»: это
        проект с искрогасителем и выводом трубы. Отдельные мангалы M-01…M-15 — если беседка
        уже стоит. Цена беседки «Огонь» — на карточках ниже.
      </p>
      <HubLeadCta note="Очаг внутри контура: размер «Огонь», дымоход, смета по Москве и МО." />
      <HubProductPicks
        slugs={['bm-32', 'bm-11', 'bm-16', 'm-03']}
        heading="Мангал в каталоге"
        catalogHref="/katalog/besedki-s-mangalom"
        catalogLabel="Каталог «Огонь»"
      />

      <h2 className="mb-3 font-heading text-2xl">Беседка с мангалом или мангальная зона</h2>
      <p className="mb-8 max-w-3xl text-text-muted">
        Зона под навесом дешевле: можно сменить чашу. Беседка «Огонь» — стол и очаг в одном контуре,
        дороже и капитальнее. Если не готовы к чеку от 420 тысяч — берите открытую{' '}
        <Link className="text-accent hover:underline" href="/besedka-3x4">
          3×4
        </Link>{' '}
        и M-03, не натягивайте «мангальную беседку» из тонкого навеса.
      </p>

      <h2 className="mb-3 font-heading text-2xl">Что закладываем по огню</h2>
      <p className="mb-8 max-w-3xl text-text-muted">
        Сталь жаровни 3–6 мм, порошок RAL 7016 снаружи. Труба и искрогаситель — в спецификации модели.
        Деревянный пол к открытому углю не ставим: в серии ДПК. Нормы СНТ по дыму разные — на замере
        смотрим розу ветров и забор соседа, не обещаем «соседа не будет пахнуть».
      </p>

      <p className="mb-8 text-sm">
        <Link className="text-accent hover:underline" href="/katalog/besedki-s-mangalom">
          Каталог «Огонь»
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/katalog/mangaly">
          Отдельные мангалы
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/tseny-na-besedki">
          Цены
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/regiony/podolsk">
          Подольск — где чаще берут «Огонь»
        </Link>
      </p>

      <CommerceHubNav current="/besedka-s-mangalom-pod-klyuch" />
      <FAQ items={FAQ_ITEMS} />
      <div id="raschet" className="mt-10">
        <h2 className="mb-3 font-heading text-2xl">Оставить заявку</h2>
        <LeadForm context="besedka-s-mangalom-pod-klyuch" />
      </div>
    </Container>
  );
}

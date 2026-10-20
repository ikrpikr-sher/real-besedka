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

const PATH = '/besedka-loft';

const FAQ_ITEMS = [
  {
    question: 'Можно ли заказать свой рисунок на панелях?',
    answer:
      'Да, индивидуальный файл под ЧПУ. Срок и цена зависят от плотности реза и повторяемости раппорта. Типовые узоры лофт / орнамент / лес уже в каталоге.',
  },
  {
    question: 'Лофт не слишком «холодный» для дачи?',
    answer:
      'Металл с порошком не «холодит» как голая сталь: сидите на мебели, пол — фанера или ДПК. Для осени и зимы берите остекление, не краску другого цвета.',
  },
  {
    question: 'Какой цвет брать к клинкеру?',
    answer:
      'RAL 7016 — дефолт открытых серий. Он держит тень и не конкурирует с тёплым кирпичом. Белый каркас — только если дом белый.',
  },
];

export function generateMetadata(): Metadata {
  const seo = getSeo(PATH, {
    title: 'Беседка лофт из металла — каталог и цены | Реал Беседки',
    description:
      'Металлические беседки в стиле лофт: каркас 80×80×3 мм, панели из стали 3 мм с ЧПУ, порошок RAL 7016. Открытые от 175 000 ₽, остеклённый лофт C8 от 550 000 ₽.',
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
      images: [{ url: '/images/otkrytye-besedki/b-18/01_hero.jpg', width: 1200, height: 800 }],
    },
  };
}

export default function LoftPage() {
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
    name: 'Беседки лофт из металла',
    url: `${site.siteUrl}${PATH}`,
    description: 'Лофт-беседки Реал Беседки: панели ЧПУ, графит, открытые и C8. Москва и МО.',
  };

  return (
    <Container className="page-section">
      <JsonLd data={[pageLd, faqLd]} />
      <Breadcrumbs
        items={[
          { label: 'Главная', href: '/' },
          { label: 'Беседка лофт', href: PATH },
        ]}
      />
      <p className="text-sm font-medium text-accent">Не чёрная труба — узор на стали 3 мм</p>
      <h1 className="page-title mb-4">Беседки лофт из металла</h1>
      <p className="mb-4 max-w-3xl text-text-muted">
        Лофт в беседке — это не «покрасить профиль в чёрный». Это геометрия каркаса, открытый фасад,
        графит RAL 7016 и декоративные панели, которые вырезают на ЧПУ из стали 3 мм: линия, орнамент,
        лес, медведи, лоси.
      </p>
      <p className="mb-8 max-w-3xl text-text-muted">
        Открытые лофт-модели начинаются от 175 000 ₽ за 2×3 (B-19). Хит 3×4 — B-17 от 185 000 ₽. Если
        нужен зимний контур в той же эстетике — серия остеклённого лофта C8 от 550 000 ₽.
      </p>

      <h2 className="mb-3 font-heading text-2xl">Из чего собирается лофт</h2>
      <p className="mb-4 max-w-3xl text-text-muted">
        Каркас 80×80×3 мм на болтах держит и открытую кровлю, и стеклопакет. Кровля — металлочерепица,
        не поликарбонат. Пол в базе — влагостойкая фанера. Покрытие — пескоструй, грунт и порошок.
      </p>
      <ul className="mb-8 max-w-3xl list-disc space-y-2 pl-5 text-text-muted">
        <li>
          Панели 1 м — классика «Графит»{' '}
          <Link className="text-accent hover:underline" href="/katalog/otkrytye-besedki/b-17">
            B-17
          </Link>
          …B-19, шестигранники.
        </li>
        <li>Панели 2 м — серия B-41…B-50, другой масштаб узора и чек от 380 000 ₽.</li>
        <li>
          Остеклённый лофт C8 — профнастил, стекло, рейка под дуб:{' '}
          <Link className="text-accent hover:underline" href="/katalog/besedki-osteklennye-loft/b-53">
            B-53
          </Link>
          .
        </li>
      </ul>

      <h2 className="mb-3 font-heading text-2xl">Как стыковать с домом</h2>
      <p className="mb-8 max-w-3xl text-text-muted">
        К кирпичу и штукатурке графит заходит спокойно. К деревянному фасаду — тёплый RAL или рейка
        под дуб на C8. На узком участке чаще ставим шестигранник 2,5–3 м: меньше мёртвых углов, чем у
        прямоугольника 3×4.
      </p>

      <h2 className="mb-3 font-heading text-2xl">Чего не обещаем</h2>
      <p className="mb-8 max-w-3xl text-text-muted">
        Лофт не маскируется под сруб и не красится «под золото». Если нужен классический навес с
        ковкой — это другой рынок. Мы делаем архитектурный каркас с лазерным узором.
      </p>

      <p className="mb-8 text-sm">
        <Link className="text-accent hover:underline" href="/osteklennaya-besedka">
          Остеклённые
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/besedka-3x4">
          3×4
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/blog/besedka-loft-pod-fasad-doma">
          Лофт под фасад
        </Link>
      </p>

      <CommerceHubNav current="/besedka-loft" />
      <FAQ items={FAQ_ITEMS} />
      <div className="mt-10">
        <h2 className="mb-3 font-heading text-2xl">Оставить заявку</h2>
        <LeadForm context="besedka-loft" />
      </div>
    </Container>
  );
}

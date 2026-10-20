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

const PATH = "/metallicheskie-besedki";

const FAQ_ITEMS = [
  {
    question: "Чем отличаются от кованых?",
    answer:
      "Ковка — декор и другая жёсткость. У нас лазерный раскрой панелей и профильная труба 80×80×3 мм под остекление.",
  },
  {
    question: "Есть ли готовые размеры?",
    answer:
      "Да: от 2×2 до 8×6, плюс серии панелей Медведи, Олени, Богатыри и др.",
  }
];

export function generateMetadata(): Metadata {
  const seo = getSeo(PATH, {
    title: "Металлические беседки — от 95 000 ₽ | Реал Беседки",
    description: "Металлические беседки от производителя: каркас 80×80×3 мм, ЧПУ. От 95 000 ₽. Москва и МО.",
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
      images: [{ url: "/images/hero-besedka.webp", width: 1200, height: 800 }],
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
    name: "Металлические беседки",
    url: `${site.siteUrl}${PATH}`,
    description: "Металлические беседки от производителя: каркас 80×80×3 мм, ЧПУ. От 95 000 ₽. Москва и МО.",
  };

  return (
    <Container className="page-section">
      <JsonLd data={[pageLd, faqLd]} />
      <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: "Металлические беседки", href: PATH }]} />
      <p className="text-sm font-medium text-accent">Плюральная голова запроса — тот же заводской металл</p>
      <h1 className="page-title mb-4">Металлические беседки</h1>
      <p className="mb-4 max-w-3xl text-text-muted">
        «Металлические беседки» в поиске часто ведут на ковку и мангал-навесы. У нас — линейка открытых, остеклённых и с мангалом на каркасе 80×80×3 мм.
      </p>
      <p className="mb-8 max-w-3xl text-text-muted">
        Открытые, хиты 3 на 3 / 3 на 4 / 4 на 4, остекление «Панорама». Производство ООО «Пулман», Москва. Цена — на карточках.
      </p>
      <HubLeadCta />
      <HubProductPicks slugs={['b-10', 'b-17', 'b-21', 'bm-11']} heading="Металлические модели" />

      <h2 className="mb-3 font-heading text-2xl">Линейки</h2>
      <ul className="mb-8 max-w-3xl list-disc space-y-2 pl-5 text-text-muted">
        <li><Link className="text-accent hover:underline" href="/otkrytaya-besedka">Открытые</Link> с панелями ЧПУ</li>
        <li><Link className="text-accent hover:underline" href="/osteklennaya-besedka">Остеклённые</Link> и <Link className="text-accent hover:underline" href="/zimnyaya-besedka">зимние</Link></li>
        <li><Link className="text-accent hover:underline" href="/besedka-s-mangalom-pod-klyuch">С мангалом</Link> серия «Огонь»</li>
      </ul>

      <CommerceHubNav current={PATH} />
      <FAQ items={FAQ_ITEMS} />
      <div id="raschet" className="mt-10">
        <h2 className="mb-3 font-heading text-2xl">Оставить заявку</h2>
        <LeadForm context={PATH.slice(1)} />
      </div>
    </Container>
  );
}

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

const PATH = "/besedka-iz-metalloprofilja";

const FAQ_ITEMS = [
  {
    question: "Это профнастил стен?",
    answer:
      "Нет. Металлопрофиль здесь — квадратная труба каркаса. Стены — панели ЧПУ или остекление.",
  },
  {
    question: "От какой цены?",
    answer:
      "Открытые от 95 000 ₽ за 2×2.",
  }
];

export function generateMetadata(): Metadata {
  const seo = getSeo(PATH, {
    title: "Беседка из металлопрофиля — труба 80×80×3 мм | Реал Беседки",
    description: "Беседка из металлопрофиля: профильная труба 80×80×3 мм, ЧПУ-панели. От 95 000 ₽. Москва и МО.",
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
    name: "Беседка из металлопрофиля",
    url: `${site.siteUrl}${PATH}`,
    description: "Беседка из металлопрофиля: профильная труба 80×80×3 мм, ЧПУ-панели. От 95 000 ₽. Москва и МО.",
  };

  return (
    <Container className="page-section">
      <JsonLd data={[pageLd, faqLd]} />
      <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: "Беседка из металлопрофиля", href: PATH }]} />
      <p className="text-sm font-medium text-accent">Профильная труба, не тонкий уголок</p>
      <h1 className="page-title mb-4">Беседка из металлопрофиля</h1>
      <p className="mb-4 max-w-3xl text-text-muted">
        Запрос «беседка из металлопрофиля» — про стойки и балки из профильной трубы. У Реал Беседок сечение 80×80×3 мм: запас под стеклопакет и снег МО.
      </p>
      <p className="mb-8 max-w-3xl text-text-muted">
        Порошок RAL, болтовой монтаж, пол фанера в базе. Смотрите также <Link className="text-accent hover:underline" href="/besedka-iz-metalla">беседка из металла</Link> и <Link className="text-accent hover:underline" href="/materialy">материалы</Link>.
      </p>
      <h2 className="mb-3 font-heading text-2xl">Почему 80×80×3</h2>
      <ul className="mb-8 max-w-3xl list-disc space-y-2 pl-5 text-text-muted">
        <li>Не «облегчёнка» 40×40 под поликарбонат.</li>
        <li>Одинаковый узел на открытых и на «Панораме».</li>
        <li>ЧПУ-панели 3 мм стыкуются с тем же каркасом.</li>
      </ul>

      <CommerceHubNav current={PATH} />
      <FAQ items={FAQ_ITEMS} />
      <div className="mt-10">
        <h2 className="mb-3 font-heading text-2xl">Оставить заявку</h2>
        <LeadForm context={PATH.slice(1)} />
      </div>
    </Container>
  );
}

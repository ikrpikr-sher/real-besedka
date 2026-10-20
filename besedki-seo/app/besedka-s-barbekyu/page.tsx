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

const PATH = "/besedka-s-barbekyu";

const FAQ_ITEMS = [
  {
    question: "Барбекю или мангал — разница?",
    answer:
      "В быту запросы смешаны. Ведём на одну металлическую серию «Огонь».",
  },
  {
    question: "Делаете кирпич?",
    answer:
      "Нет.",
  }
];

export function generateMetadata(): Metadata {
  const seo = getSeo(PATH, {
    title: "Беседка с барбекю — от 420 000 ₽ | Реал Беседки",
    description: "Беседка с барбекю из металла: серия «Огонь» от 420 000 ₽. Москва и МО. Реал Беседки.",
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
      images: [{ url: "/images/mangaly/barbekyu-zona-loft.jpg", width: 1200, height: 800 }],
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
    name: "Беседка с барбекю",
    url: `${site.siteUrl}${PATH}`,
    description: "Беседка с барбекю из металла: серия «Огонь» от 420 000 ₽. Москва и МО. Реал Беседки.",
  };

  return (
    <Container className="page-section">
      <JsonLd data={[pageLd, faqLd]} />
      <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: "Беседка с барбекю", href: PATH }]} />
      <p className="text-sm font-medium text-accent">Барбекю / гриль в запросе → серия «Огонь»</p>
      <h1 className="page-title mb-4">Беседка с барбекю</h1>
      <p className="mb-4 max-w-3xl text-text-muted">
        «Беседка с барбекю» и «беседка гриль» в выдаче часто = кирпичный комплекс или мангал-магазин. У нас — металлическая беседка с зоной жарки серии «Огонь», не кирпичная кладка.
      </p>
      <p className="mb-8 max-w-3xl text-text-muted">
        От 420 000 ₽. Смежные страницы: <Link className="text-accent hover:underline" href="/besedka-s-mangalom-pod-klyuch">с мангалом</Link>, <Link className="text-accent hover:underline" href="/barbekyu-zona">барбекю-зона</Link>, <Link className="text-accent hover:underline" href="/besedka-s-mangalnoy-zonoy">с мангальной зоной</Link>.
      </p>
      <h2 className="mb-3 font-heading text-2xl">Что входит</h2>
      <ul className="mb-8 max-w-3xl list-disc space-y-2 pl-5 text-text-muted">
        <li>Каркас 80×80, кровля, пол.</li>
        <li>Жаровня / казан по комплектации модели.</li>
        <li>Дымоход и посадка под безопасный отступ.</li>
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

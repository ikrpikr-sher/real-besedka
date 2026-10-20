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

const PATH = "/besedka-naves";

const FAQ_ITEMS = [
  {
    question: "Можно навес «превратить» в беседку?",
    answer:
      "Лучше сразу считать беседку: пол, панели, узлы другие.",
  },
  {
    question: "Что дешевле?",
    answer:
      "Навес обычно дешевле. Беседка — другой объём металла и комплектации.",
  }
];

export function generateMetadata(): Metadata {
  const seo = getSeo(PATH, {
    title: "Беседка-навес из металла — когда навес, когда беседка | Реал Беседки",
    description: "Беседка или навес из металла: как не перепутать. Каркас 80×80. Москва и МО.",
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
    name: "Беседка-навес",
    url: `${site.siteUrl}${PATH}`,
    description: "Беседка или навес из металла: как не перепутать. Каркас 80×80. Москва и МО.",
  };

  return (
    <Container className="page-section">
      <JsonLd data={[pageLd, faqLd]} />
      <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: "Беседка-навес", href: PATH }]} />
      <p className="text-sm font-medium text-accent">Два разных изделия — не путать в смете</p>
      <h1 className="page-title mb-4">Беседка-навес</h1>
      <p className="mb-4 max-w-3xl text-text-muted">
        Запросы «беседка навес» и «навес беседка» смешивают навес для авто/мангала и полноценную беседку с полом и панелями. Ниже — как выбрать у нас.
      </p>
      <div className="mb-8 overflow-x-auto">
        <table className="w-full min-w-[28rem] text-left text-sm">
          <thead><tr className="border-b border-border">
            <th className="py-2 pr-3">Нужно</th>
            <th className="py-2">Страница</th>
          </tr></thead>
          <tbody className="text-text-muted">
            <tr className="border-b border-border"><td className="py-2 pr-3">Посадка, панели, «как комната»</td><td className="py-2"><Link className="text-accent hover:underline" href="/otkrytaya-besedka">Открытая беседка</Link></td></tr>
            <tr className="border-b border-border"><td className="py-2 pr-3">Крыша без стен / авто</td><td className="py-2"><Link className="text-accent hover:underline" href="/metallicheskiy-naves">Металлический навес</Link></td></tr>
            <tr className="border-b border-border"><td className="py-2 pr-3">Жарка под крышей</td><td className="py-2"><Link className="text-accent hover:underline" href="/mangalnaya-zona">Мангальная зона</Link></td></tr>
          </tbody>
        </table>
      </div>

      <CommerceHubNav current={PATH} />
      <FAQ items={FAQ_ITEMS} />
      <div className="mt-10">
        <h2 className="mb-3 font-heading text-2xl">Оставить заявку</h2>
        <LeadForm context={PATH.slice(1)} />
      </div>
    </Container>
  );
}

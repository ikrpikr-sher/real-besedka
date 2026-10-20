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

const PATH = "/besedka-metall-ili-derevo";

const FAQ_ITEMS = [
  {
    question: "Почему не делать дерево?",
    answer:
      "Другой цех и компетенции. Честнее не размывать оффер.",
  },
  {
    question: "Металл холодный зимой?",
    answer:
      "Открытая — да, как любая. Зимний контур — остекление «Панорама», не «мягкие окна».",
  }
];

export function generateMetadata(): Metadata {
  const seo = getSeo(PATH, {
    title: "Беседка из металла или дерева — честное сравнение | Реал Беседки",
    description: "Металл или дерево для беседки: сравнение ухода, остекления и чека. Реал Беседки — каркас 80×80×3 мм.",
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
    name: "Металл или дерево: что брать",
    url: `${site.siteUrl}${PATH}`,
    description: "Металл или дерево для беседки: сравнение ухода, остекления и чека. Реал Беседки — каркас 80×80×3 мм.",
  };

  return (
    <Container className="page-section">
      <JsonLd data={[pageLd, faqLd]} />
      <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: "Металл или дерево: что брать", href: PATH }]} />
      <p className="text-sm font-medium text-accent">Не «дерево плохо» — другой продукт и чек</p>
      <h1 className="page-title mb-4">Металл или дерево: что брать</h1>
      <p className="mb-4 max-w-3xl text-text-muted">
        Деревянные фабрики держат «под ключ» и «3 на 3» дешевле на входе. Мы не конкурируем брусом за 150 тысяч: наш контур — металл 80×80 с порошком и запасом под стекло.
      </p>
      <div className="mb-8 overflow-x-auto">
        <table className="w-full min-w-[32rem] text-left text-sm">
          <thead><tr className="border-b border-border">
            <th className="py-2 pr-3">Критерий</th>
            <th className="py-2 pr-3">Дерево (рынок)</th>
            <th className="py-2">Наш металл</th>
          </tr></thead>
          <tbody className="text-text-muted">
            <tr className="border-b border-border"><td className="py-2 pr-3">Входной чек</td><td className="py-2 pr-3">Часто 130–220 тыс.</td><td className="py-2">Открытые от 95 тыс., дизайн-ряды выше</td></tr>
            <tr className="border-b border-border"><td className="py-2 pr-3">Уход</td><td className="py-2 pr-3">Антисептик, щели</td><td className="py-2">Порошок, без ежегодной перекраски стоек</td></tr>
            <tr className="border-b border-border"><td className="py-2 pr-3">Остекление</td><td className="py-2 pr-3">Часто доработка</td><td className="py-2">Каркас сразу под стеклопакет</td></tr>
            <tr className="border-b border-border"><td className="py-2 pr-3">Рисунок панелей</td><td className="py-2 pr-3">Решетка / вагонка</td><td className="py-2">ЧПУ: Медведи, Олени, Дамаск…</td></tr>
          </tbody>
        </table>
      </div>
      <p className="mb-8 max-w-3xl text-text-muted">
        Если нужен брус «как у соседа» — мы не ваш завод. Если нужна металлическая беседка под ключ в Москве — <Link className="text-accent hover:underline" href="/katalog">каталог</Link>.
      </p>

      <CommerceHubNav current={PATH} />
      <FAQ items={FAQ_ITEMS} />
      <div className="mt-10">
        <h2 className="mb-3 font-heading text-2xl">Оставить заявку</h2>
        <LeadForm context={PATH.slice(1)} />
      </div>
    </Container>
  );
}

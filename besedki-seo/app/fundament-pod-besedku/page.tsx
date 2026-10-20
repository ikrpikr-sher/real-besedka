import type { Metadata } from 'next';
import Link from 'next/link';
import Container from '@/components/Container';
import Breadcrumbs from '@/components/Breadcrumbs';
import FAQ from '@/components/FAQ';
import JsonLd from '@/components/JsonLd';
import LeadForm from '@/components/LeadForm';
import { getSeo } from '@/lib/seo';
import { getSite } from '@/lib/content';

const PATH = '/fundament-pod-besedku';

const FAQ_ITEMS = [
  {
    question: 'Можно ли без фундамента?',
    answer:
      'Нет для постоянной установки.',
  },
  {
    question: 'Делаете фундамент сами?',
    answer:
      'Организуем или принимаем готовое по допускам.',
  }
];

export function generateMetadata(): Metadata {
  const seo = getSeo(PATH, {
    title: 'Фундамент под беседку — сваи, плита, лента | Реал Беседки',
    description: 'Какой фундамент под металлическую беседку: винтовые сваи, плита, лента. Подбор под грунт МО. Реал Беседки.',
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
      images: [{ url: '/images/hero-besedka.webp', width: 1200, height: 800 }],
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
    name: 'Фундамент под металлическую беседку',
    url: `${site.siteUrl}${PATH}`,
    description: 'Какой фундамент под металлическую беседку: винтовые сваи, плита, лента. Подбор под грунт МО. Реал Беседки.',
  };

  return (
    <Container className="page-section">
      <JsonLd data={[pageLd, faqLd]} />
      <Breadcrumbs
        items={[
          { label: 'Главная', href: '/' },
          { label: 'Фундамент под беседку', href: PATH },
        ]}
      />
      <p className="text-sm font-medium text-accent">Сначала основание, потом каркас</p>
      <h1 className="page-title mb-4">Фундамент под металлическую беседку</h1>
      <p className="mb-4 max-w-3xl text-text-muted">
        Без основания заводской каркас не ставим. В МО чаще винтовые сваи; на слабом грунте и под стекло — плита; лента — по проекту. Тип выбираем на замере, не «на глаз по картинке».
      </p>
      <p className="mb-8 max-w-3xl text-text-muted">
        Цена фундамента не входит в priceFrom модели в каталоге.
      </p>

      <h2 className="mb-3 font-heading text-2xl">Варианты</h2>
      <div className="mb-8 overflow-x-auto">
        <table className="w-full min-w-[32rem] text-left text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="py-2 pr-3">Тип</th>
              <th className="py-2 pr-3">Когда</th>
              <th className="py-2">Комментарий</th>
            </tr>
          </thead>
          <tbody className="text-text-muted">
            <tr className="border-b border-border">
              <td className="py-2 pr-3">Винтовые сваи</td>
              <td className="py-2 pr-3">глина, перепад</td>
              <td className="py-2">часто под открытые</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-3">Плита</td>
              <td className="py-2 pr-3">торф, высокая вода, остекление</td>
              <td className="py-2">жёстче геометрия</td>
            </tr>
            <tr className="">
              <td className="py-2 pr-3">Лента</td>
              <td className="py-2 pr-3">по проекту</td>
              <td className="py-2">реже для наших пятён</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="mb-3 font-heading text-2xl">Дальше</h2>
      <p className="mb-4 max-w-3xl text-text-muted">
        Не плодим сотни статей «сваи + любой город РФ». Рабочий разбор — здесь и в двух статьях по МО.
        Каталог моделей — отдельно.
      </p>
      <p className="mb-8 max-w-3xl text-text-muted">
        <Link className="text-accent hover:underline" href="/besedka-na-svayah">
          Беседка на сваях
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/dostavka-i-montazh">
          Монтаж
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/blog/vintovye-svai-pod-besedku">
          Сваи в МО
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/blog/fundament-dlya-besedki-kakoy-vybrat">
          Какой фундамент
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/katalog">
          Каталог
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/regiony">
          Города МО
        </Link>
      </p>

      <p className="mb-8 text-sm">
        <Link className="text-accent hover:underline" href="/besedka-na-svayah">
          На сваях
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/dostavka-i-montazh">
          Доставка и монтаж
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/besedka-pod-klyuch">
          Под ключ
        </Link>
        {' · '}
        <Link className="text-accent hover:underline" href="/kontakty">
          Заявка
        </Link>
      </p>

      <FAQ items={FAQ_ITEMS} />
      <div className="mt-10">
        <h2 className="mb-3 font-heading text-2xl">Оставить заявку</h2>
        <LeadForm context="fundament-pod-besedku" />
      </div>
    </Container>
  );
}

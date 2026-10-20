import type { Metadata } from 'next';
import Link from 'next/link';
import Container from '@/components/Container';
import Breadcrumbs from '@/components/Breadcrumbs';
import JsonLd from '@/components/JsonLd';
import LeadForm from '@/components/LeadForm';
import { getSeo } from '@/lib/seo';
import { getSite, TWOGIS_FIRM_URL } from '@/lib/content';

const PATH = '/otzyvy';

export function generateMetadata(): Metadata {
  const seo = getSeo(PATH, {
    title: 'Отзывы о Реал Беседки — 2ГИС и заявки',
    description:
      'Отзывы о металлических беседках ООО «Пулман»: карточка в 2ГИС, производство на Складочной. Без накрученных звёзд на сайте.',
  });
  return {
    title: { absolute: seo.title },
    description: seo.description,
    alternates: { canonical: PATH },
  };
}

export default function OtzyvyPage() {
  const site = getSite();
  const pageLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Отзывы о Реал Беседки',
    url: `${site.siteUrl}${PATH}`,
    description:
      'Свежие отзывы клиентов смотрите в карточке 2ГИС. На сайте не публикуем выдуманный AggregateRating.',
    about: {
      '@type': 'LocalBusiness',
      name: site.siteName,
      url: site.siteUrl,
      hasMap: TWOGIS_FIRM_URL,
    },
  };

  return (
    <Container className="page-section">
      <JsonLd data={pageLd} />
      <Breadcrumbs
        items={[
          { label: 'Главная', href: '/' },
          { label: 'Отзывы', href: PATH },
        ]}
      />
      <h1 className="page-title mb-4">Отзывы</h1>
      <p className="mb-4 max-w-3xl text-text-muted">
        Не рисуем на сайте звёзды «из воздуха» — поисковики это видят. Актуальные оценки и тексты
        клиентов — в карточке компании на 2ГИС (производство и шоурум на Складочной).
      </p>
      <p className="mb-8">
        <a
          className="text-accent underline-offset-2 hover:underline"
          href={TWOGIS_FIRM_URL}
          rel="noopener noreferrer"
          target="_blank"
        >
          Отзывы в 2ГИС →
        </a>
        {' · '}
        <Link className="text-accent underline-offset-2 hover:underline" href="/proekty">
          Портфолио моделей
        </Link>
        {' · '}
        <Link className="text-accent underline-offset-2 hover:underline" href="/kontakty">
          Оставить заявку
        </Link>
      </p>
      <h2 className="mb-3 font-heading text-2xl">Как мы работаем с обратной связью</h2>
      <ul className="mb-8 max-w-3xl list-disc space-y-2 pl-5 text-text-muted">
        <li>После монтажа просим оценку в 2ГИС — там же видно дату и автора.</li>
        <li>Претензии по геометрии и покрытию разбираем по фото и акту, не «ответом в комментариях».</li>
        <li>Схема AggregateRating в коде появится, когда подключим выгрузку реальных оценок — не раньше.</li>
      </ul>
      <div className="mt-10">
        <h2 className="mb-3 font-heading text-2xl">Нужен расчёт</h2>
        <LeadForm context="otzyvy" />
      </div>
    </Container>
  );
}

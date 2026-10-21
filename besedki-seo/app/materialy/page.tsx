import type { Metadata } from 'next';
import Container from '@/components/Container';
import Breadcrumbs from '@/components/Breadcrumbs';
import MaterialCard from '@/components/MaterialCard';
import JsonLd from '@/components/JsonLd';
import { getMaterialy, getSite } from '@/lib/content';
import { getSeo } from '@/lib/seo';

export function generateMetadata(): Metadata {
  const seo = getSeo('/materialy', {
    title: 'Материалы для беседок: дерево, металл, поликарбонат',
    description: 'Сравнение материалов для беседок — дерево, металл, поликарбонат: плюсы, минусы, что выбрать под ваш участок.',
  });
  return { title: seo.title, description: seo.description, alternates: { canonical: '/materialy' } };
}

export default function MaterialyPage() {
  const materialy = getMaterialy();
  const site = getSite();
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Главная', item: site.siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Материалы', item: `${site.siteUrl}/materialy` },
    ],
  };

  return (
    <Container className="page-section">
      <JsonLd data={breadcrumbLd} />
      <Breadcrumbs schema={false} items={[{ label: 'Главная', href: '/' }, { label: 'Материалы', href: '/materialy' }]} />
      <h1 className="page-title mb-6">Материалы</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {materialy.map((m) => (
          <MaterialCard key={m.slug} material={m} />
        ))}
      </div>
    </Container>
  );
}

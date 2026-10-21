import type { Metadata } from 'next';
import Container from '@/components/Container';
import Breadcrumbs from '@/components/Breadcrumbs';
import ServiceCard from '@/components/ServiceCard';
import JsonLd from '@/components/JsonLd';
import { getSite, getUslugi } from '@/lib/content';
import { getSeo } from '@/lib/seo';

export function generateMetadata(): Metadata {
  const seo = getSeo('/uslugi', {
    title: 'Услуги — проектирование, изготовление и монтаж беседок',
    description: 'Беседки под ключ: проектирование, изготовление и монтаж. Полный цикл от замера участка до сдачи объекта.',
  });
  return { title: seo.title, description: seo.description, alternates: { canonical: '/uslugi' } };
}

export default function UslugiPage() {
  const uslugi = getUslugi();
  const site = getSite();
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Главная', item: site.siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Услуги', item: `${site.siteUrl}/uslugi` },
    ],
  };

  return (
    <Container className="page-section">
      <JsonLd data={breadcrumbLd} />
      <Breadcrumbs schema={false} items={[{ label: 'Главная', href: '/' }, { label: 'Услуги', href: '/uslugi' }]} />
      <h1 className="page-title mb-6">Услуги</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {uslugi.map((u) => (
          <ServiceCard key={u.slug} service={u} />
        ))}
      </div>
    </Container>
  );
}

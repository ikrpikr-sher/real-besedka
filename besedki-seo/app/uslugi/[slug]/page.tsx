import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Container from '@/components/Container';
import Breadcrumbs from '@/components/Breadcrumbs';
import LeadForm from '@/components/LeadForm';
import JsonLd from '@/components/JsonLd';
import { getSite, getUsluga } from '@/lib/content';

type Props = { params: { slug: string } };

export function generateMetadata({ params }: Props): Metadata {
  const service = getUsluga(params.slug);
  if (!service) return {};
  return {
    title: service.title,
    description: service.summary.slice(0, 250),
    alternates: { canonical: `/uslugi/${service.slug}` },
  };
}

export default function ServicePage({ params }: Props) {
  const service = getUsluga(params.slug);
  if (!service) notFound();

  const site = getSite();
  const serviceLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.title,
    description: service.summary,
    provider: { '@type': 'Organization', name: site.legalName },
  };
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Главная', item: site.siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Услуги', item: `${site.siteUrl}/uslugi` },
      { '@type': 'ListItem', position: 3, name: service.title, item: `${site.siteUrl}/uslugi/${service.slug}` },
    ],
  };

  return (
    <Container className="page-section">
      <JsonLd data={[serviceLd, breadcrumbLd]} />
      <Breadcrumbs
        items={[
          { label: 'Главная', href: '/' },
          { label: 'Услуги', href: '/uslugi' },
          { label: service.title, href: `/uslugi/${service.slug}` },
        ]}
      />
      <div className="grid gap-8 md:grid-cols-3 lg:gap-10">
        <div className="md:col-span-2">
          {service.coverImage ? (
            <div className="mb-6 aspect-[16/9] overflow-hidden rounded-DEFAULT bg-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={service.coverImage} alt={service.title} className="h-full w-full object-cover" />
            </div>
          ) : null}
          <h1 className="page-title">{service.title}</h1>
          <p className="text-text-muted">{service.summary}</p>
          <h2 className="mt-8 font-heading text-xl">Этапы работы</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm">
            {service.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>
        <div className="lg:sticky lg:top-20 lg:self-start">
          <LeadForm context={`Услуга: ${service.title}`} />
        </div>
      </div>
    </Container>
  );
}

import type { Metadata } from 'next';
import Container from '@/components/Container';
import Breadcrumbs from '@/components/Breadcrumbs';
import { getBuilderConfig } from '@/lib/builder';
import type { CatalogItemLite } from '@/lib/builder';
import { getKatalog } from '@/lib/content';
import { getSeo } from '@/lib/seo';
import BuilderClient from './BuilderClient';

export function generateMetadata(): Metadata {
  const seo = getSeo('/konfigurator', {
    title: 'Конфигуратор беседки — соберите под себя',
    description:
      'Выберите размер, тип и рисунок панелей. 3D-модель и расчёт цены онлайн.',
  });
  return { title: seo.title, description: seo.description, alternates: { canonical: '/konfigurator' } };
}

function toLite(items: ReturnType<typeof getKatalog>): CatalogItemLite[] {
  return items.map((item) => ({
    slug: item.slug,
    title: item.title,
    size: item.size,
    priceFrom: item.priceFrom,
    tagline: item.tagline,
    images: item.images,
    model3d: item.model3d,
    configuratorId: item.configuratorId,
  }));
}

export default function KonfiguratorPage() {
  const config = getBuilderConfig();
  const katalog = getKatalog();
  const openItems = toLite(katalog.filter((item) => item.category === 'otkrytye-besedki'));
  const glazedItems = toLite(katalog.filter((item) => item.category === 'besedki-s-ostekleniem'));

  return (
    <Container className="page-section">
      <Breadcrumbs
        items={[
          { label: 'Главная', href: '/' },
          { label: config.title, href: '/konfigurator' },
        ]}
      />
      <h1 className="page-title mb-1">{config.title}</h1>
      <p className="mb-5 max-w-2xl text-sm text-text-muted">{config.intro}</p>
      <BuilderClient config={config} openItems={openItems} closedItems={glazedItems} />
    </Container>
  );
}

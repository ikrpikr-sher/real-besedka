import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Container from '@/components/Container';
import Breadcrumbs from '@/components/Breadcrumbs';
import LeadForm from '@/components/LeadForm';
import { getMaterial } from '@/lib/content';

type Props = { params: { slug: string } };

export function generateMetadata({ params }: Props): Metadata {
  const material = getMaterial(params.slug);
  if (!material) return {};
  return {
    title: material.title,
    description: material.summary.slice(0, 250),
    alternates: { canonical: `/materialy/${material.slug}` },
  };
}

export default function MaterialPage({ params }: Props) {
  const material = getMaterial(params.slug);
  if (!material) notFound();

  return (
    <Container className="page-section">
      <Breadcrumbs
        items={[
          { label: 'Главная', href: '/' },
          { label: 'Материалы', href: '/materialy' },
          { label: material.title, href: `/materialy/${material.slug}` },
        ]}
      />
      <div className="grid gap-8 md:grid-cols-3 lg:gap-10">
        <div className="md:col-span-2">
          {material.coverImage ? (
            <div className="mb-6 aspect-[16/9] overflow-hidden rounded-DEFAULT bg-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={material.coverImage} alt={material.title} className="h-full w-full object-cover" />
            </div>
          ) : null}
          <h1 className="page-title">{material.title}</h1>
          <p className="text-text-muted">{material.summary}</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <h2 className="font-heading text-lg">Плюсы</h2>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                {material.pros.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="font-heading text-lg">Минусы</h2>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                {material.cons.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="lg:sticky lg:top-20 lg:self-start">
          <LeadForm context={`Материал: ${material.title}`} />
        </div>
      </div>
    </Container>
  );
}

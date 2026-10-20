import { notFound } from 'next/navigation';
import KatalogForm from '@/components/admin/KatalogForm';
import { readCatalogItems } from '@/lib/katalogStore';

export const dynamic = 'force-dynamic';

export default function AdminKatalogEditPage({ params }: { params: { slug: string } }) {
  const item = readCatalogItems().find((p) => p.slug === params.slug);
  if (!item) notFound();

  return (
    <div>
      <h1 className="mb-6 font-heading text-2xl">Редактировать: {item.title}</h1>
      <KatalogForm initial={item} />
    </div>
  );
}

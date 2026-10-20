import { notFound } from 'next/navigation';
import { readJson } from '@/lib/contentStore';
import UslugiForm from '@/components/admin/UslugiForm';
import type { ServiceItem } from '@/app/api/admin/uslugi/route';

export default function EditServicePage({ params }: { params: { slug: string } }) {
  const items = readJson<ServiceItem[]>('uslugi.json');
  const item = items.find((u) => u.slug === params.slug);
  if (!item) notFound();

  return (
    <div>
      <h1 className="mb-6 font-heading text-2xl">Редактировать: {item.title}</h1>
      <UslugiForm initial={item} />
    </div>
  );
}

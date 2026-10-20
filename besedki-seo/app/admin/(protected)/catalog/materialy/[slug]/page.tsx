import { notFound } from 'next/navigation';
import { readJson } from '@/lib/contentStore';
import MaterialyForm from '@/components/admin/MaterialyForm';
import type { MaterialItem } from '@/app/api/admin/materialy/route';

export default function EditMaterialPage({ params }: { params: { slug: string } }) {
  const items = readJson<MaterialItem[]>('materialy.json');
  const item = items.find((m) => m.slug === params.slug);
  if (!item) notFound();

  return (
    <div>
      <h1 className="mb-6 font-heading text-2xl">Редактировать: {item.title}</h1>
      <MaterialyForm initial={item} />
    </div>
  );
}

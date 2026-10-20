import { notFound } from 'next/navigation';
import { readJson } from '@/lib/contentStore';
import ProektyForm from '@/components/admin/ProektyForm';
import type { Project } from '@/app/api/admin/proekty/route';

export default function EditProjectPage({ params }: { params: { slug: string } }) {
  const items = readJson<Project[]>('proekty.json');
  const item = items.find((p) => p.slug === params.slug);
  if (!item) notFound();

  return (
    <div>
      <h1 className="mb-6 font-heading text-2xl">Редактировать: {item.title}</h1>
      <ProektyForm initial={item} />
    </div>
  );
}

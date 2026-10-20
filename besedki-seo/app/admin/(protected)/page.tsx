import Link from 'next/link';
import fs from 'node:fs';
import path from 'node:path';
import { readJson } from '@/lib/contentStore';
import { getAllPosts } from '@/lib/blog';
import AdminLeadsSummary from '@/components/admin/AdminLeadsSummary';

export const dynamic = 'force-dynamic';

function countCatalogItems(): number {
  const dataDir = path.join(process.cwd(), 'data');
  if (fs.existsSync(path.join(dataDir, 'katalog.json'))) {
    return readJson<unknown[]>('katalog.json').length;
  }
  if (fs.existsSync(path.join(dataDir, 'proekty.json'))) {
    return readJson<unknown[]>('proekty.json').length;
  }
  return 0;
}

export default function AdminDashboardPage() {
  const uslugi = readJson<unknown[]>('uslugi.json');
  const materialy = readJson<unknown[]>('materialy.json');
  const posts = getAllPosts();

  const cards = [
    { label: 'Товаров в каталоге', value: countCatalogItems(), href: '/admin/catalog/katalog' },
    { label: 'Услуги', value: uslugi.length, href: '/admin/catalog/uslugi' },
    { label: 'Материалы', value: materialy.length, href: '/admin/catalog/materialy' },
    { label: 'Статьи блога', value: posts.length, href: '/admin/blog' },
  ];

  return (
    <div>
      <h1 className="mb-6 font-heading text-2xl">Обзор</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AdminLeadsSummary />
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className="card block hover:shadow-md">
            <p className="text-sm text-text-muted">{c.label}</p>
            <p className="mt-1 font-heading text-3xl">{c.value}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

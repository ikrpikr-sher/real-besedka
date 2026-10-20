'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchJson } from '@/lib/fetchJson';

type MaterialItem = { slug: string; title: string; summary: string };

export default function AdminMaterialyListPage() {
  const [items, setItems] = useState<MaterialItem[] | null>(null);

  async function load() {
    try {
      const { data } = await fetchJson<{ items?: MaterialItem[] }>('/api/admin/materialy', { credentials: 'same-origin' });
      setItems(data.items || []);
    } catch {
      setItems([]);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function remove(slug: string) {
    if (!confirm(`Удалить материал «${slug}»?`)) return;
    await fetch(`/api/admin/materialy/${slug}`, { method: 'DELETE' });
    load();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl">Материалы</h1>
        <Link href="/admin/catalog/materialy/new" className="btn-primary text-sm">
          + Новый материал
        </Link>
      </div>
      {!items ? (
        <p className="text-text-muted">Загрузка…</p>
      ) : items.length === 0 ? (
        <p className="text-text-muted">Пока нет материалов.</p>
      ) : (
        <div className="space-y-2">
          {items.map((m) => (
            <div key={m.slug} className="card flex items-center justify-between">
              <div>
                <p className="font-medium">{m.title}</p>
                <p className="text-xs text-text-muted">/materialy/{m.slug}</p>
              </div>
              <div className="flex gap-3 text-sm">
                <Link href={`/admin/catalog/materialy/${m.slug}`} className="text-accent hover:underline">
                  Редактировать
                </Link>
                <button type="button" onClick={() => remove(m.slug)} className="text-red-600 hover:underline">
                  Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

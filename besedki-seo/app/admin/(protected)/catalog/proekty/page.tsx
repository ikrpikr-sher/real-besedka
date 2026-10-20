'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchJson } from '@/lib/fetchJson';

type Project = { slug: string; title: string; priceFrom: number };

export default function AdminProektyListPage() {
  const [items, setItems] = useState<Project[] | null>(null);

  async function load() {
    try {
      const { data } = await fetchJson<{ items?: Project[] }>('/api/admin/proekty', { credentials: 'same-origin' });
      setItems(data.items || []);
    } catch {
      setItems([]);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function remove(slug: string) {
    if (!confirm(`Удалить проект «${slug}»?`)) return;
    await fetch(`/api/admin/proekty/${slug}`, { method: 'DELETE' });
    load();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl">Каталог</h1>
        <Link href="/admin/catalog/proekty/new" className="btn-primary text-sm">
          + Новый проект
        </Link>
      </div>
      {!items ? (
        <p className="text-text-muted">Загрузка…</p>
      ) : items.length === 0 ? (
        <p className="text-text-muted">Пока нет проектов.</p>
      ) : (
        <div className="space-y-2">
          {items.map((p) => (
            <div key={p.slug} className="card flex items-center justify-between">
              <div>
                <p className="font-medium">{p.title}</p>
                <p className="text-xs text-text-muted">
                  /proekty/{p.slug} · от {p.priceFrom.toLocaleString('ru-RU')} ₽
                </p>
              </div>
              <div className="flex gap-3 text-sm">
                <Link href={`/admin/catalog/proekty/${p.slug}`} className="text-accent hover:underline">
                  Редактировать
                </Link>
                <button type="button" onClick={() => remove(p.slug)} className="text-red-600 hover:underline">
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

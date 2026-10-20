'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchJson } from '@/lib/fetchJson';

type ServiceItem = { slug: string; title: string; summary: string };

export default function AdminUslugiListPage() {
  const [items, setItems] = useState<ServiceItem[] | null>(null);

  async function load() {
    try {
      const { data } = await fetchJson<{ items?: ServiceItem[] }>('/api/admin/uslugi', { credentials: 'same-origin' });
      setItems(data.items || []);
    } catch {
      setItems([]);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function remove(slug: string) {
    if (!confirm(`Удалить услугу «${slug}»?`)) return;
    await fetch(`/api/admin/uslugi/${slug}`, { method: 'DELETE' });
    load();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl">Услуги</h1>
        <Link href="/admin/catalog/uslugi/new" className="btn-primary text-sm">
          + Новая услуга
        </Link>
      </div>
      {!items ? (
        <p className="text-text-muted">Загрузка…</p>
      ) : items.length === 0 ? (
        <p className="text-text-muted">Пока нет услуг.</p>
      ) : (
        <div className="space-y-2">
          {items.map((u) => (
            <div key={u.slug} className="card flex items-center justify-between">
              <div>
                <p className="font-medium">{u.title}</p>
                <p className="text-xs text-text-muted">/uslugi/{u.slug}</p>
              </div>
              <div className="flex gap-3 text-sm">
                <Link href={`/admin/catalog/uslugi/${u.slug}`} className="text-accent hover:underline">
                  Редактировать
                </Link>
                <button type="button" onClick={() => remove(u.slug)} className="text-red-600 hover:underline">
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

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchJson } from '@/lib/fetchJson';

type Post = { slug: string; title: string; category: string; date: string };

export default function AdminBlogListPage() {
  const [items, setItems] = useState<Post[] | null>(null);

  async function load() {
    try {
      const { data } = await fetchJson<{ items?: Post[] }>('/api/admin/posts', { credentials: 'same-origin' });
      setItems(data.items || []);
    } catch {
      setItems([]);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function remove(slug: string) {
    if (!confirm(`Удалить статью «${slug}»?`)) return;
    await fetch(`/api/admin/posts/${slug}`, { method: 'DELETE' });
    load();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl">Блог</h1>
        <Link href="/admin/blog/new" className="btn-primary text-sm">
          + Новая статья
        </Link>
      </div>
      {!items ? (
        <p className="text-text-muted">Загрузка…</p>
      ) : items.length === 0 ? (
        <p className="text-text-muted">Пока нет статей.</p>
      ) : (
        <div className="space-y-2">
          {items.map((p) => (
            <div key={p.slug} className="card flex items-center justify-between">
              <div>
                <p className="font-medium">{p.title}</p>
                <p className="text-xs text-text-muted">
                  /blog/{p.slug} · {p.category} · {new Date(p.date).toLocaleDateString('ru-RU')}
                </p>
              </div>
              <div className="flex gap-3 text-sm">
                <Link href={`/admin/blog/${p.slug}`} className="text-accent hover:underline">
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

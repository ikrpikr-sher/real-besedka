'use client';

import { useEffect, useState } from 'react';
import { fetchJson } from '@/lib/fetchJson';

import { SEO_ROUTES } from '@/lib/seoRoutes';

type Entry = { title: string; description: string };

export default function AdminSeoPage() {
  const [map, setMap] = useState<Record<string, Entry>>({});
  const [loaded, setLoaded] = useState(false);
  const [savingRoute, setSavingRoute] = useState<string | null>(null);
  const [savedRoute, setSavedRoute] = useState<string | null>(null);

  useEffect(() => {
    fetchJson<{ map?: Record<string, Entry> }>('/api/admin/seo', { credentials: 'same-origin' })
      .then(({ data }) => {
        setMap(data.map || {});
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  function update(route: string, field: keyof Entry, value: string) {
    setMap((prev) => ({ ...prev, [route]: { ...(prev[route] || { title: '', description: '' }), [field]: value } }));
  }

  async function save(route: string) {
    setSavingRoute(route);
    setSavedRoute(null);
    const entry = map[route] || { title: '', description: '' };
    try {
      await fetchJson('/api/admin/seo', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ route, ...entry }),
        credentials: 'same-origin',
      });
      setSavedRoute(route);
    } catch {
      /* keep UI responsive */
    } finally {
      setSavingRoute(null);
      setTimeout(() => setSavedRoute((r) => (r === route ? null : r)), 2000);
    }
  }

  return (
    <div>
      <h1 className="mb-2 font-heading text-2xl">SEO</h1>
      <p className="mb-6 max-w-2xl text-sm text-text-muted">
        Title и description для основных статических страниц. У проектов/услуг/материалов и статей блога свои title/description
        задаются прямо в карточке товара или статьи — редактируйте их в соответствующих разделах.
      </p>
      {!loaded ? (
        <p className="text-text-muted">Загрузка…</p>
      ) : (
        <div className="max-w-2xl space-y-4">
          {SEO_ROUTES.map(({ route, label }) => {
            const entry = map[route] || { title: '', description: '' };
            return (
              <div key={route} className="card space-y-2">
                <p className="text-sm font-medium">
                  {label} <span className="text-text-muted">({route})</span>
                </p>
                <label className="block">
                  <span className="mb-1 block text-xs text-text-muted">Title</span>
                  <input value={entry.title} onChange={(e) => update(route, 'title', e.target.value)} className="input" />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs text-text-muted">Description</span>
                  <textarea
                    rows={2}
                    value={entry.description}
                    onChange={(e) => update(route, 'description', e.target.value)}
                    className="input"
                  />
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => save(route)}
                    disabled={savingRoute === route}
                    className="btn-secondary text-xs disabled:opacity-60"
                  >
                    {savingRoute === route ? 'Сохраняем…' : 'Сохранить'}
                  </button>
                  {savedRoute === route && <span className="text-xs text-accent">Сохранено</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

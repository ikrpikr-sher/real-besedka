'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { fetchJson } from '@/lib/fetchJson';
import { CATALOG_CATEGORIES, getCatalogCategory, type CatalogCategorySlug } from '@/lib/catalogCategories';
import type { CatalogItem } from '@/lib/content';

export default function AdminKatalogListPage() {
  const [items, setItems] = useState<CatalogItem[] | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [saving, setSaving] = useState(false);
  const [fillingSeo, setFillingSeo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  async function load() {
    try {
      const { data } = await fetchJson<{ items?: CatalogItem[] }>('/api/admin/katalog', {
        credentials: 'same-origin',
      });
      setItems(data.items || []);
      setError(null);
    } catch {
      setItems([]);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!items) return null;
    if (filter === 'all') return items;
    return items.filter((item) => item.category === filter);
  }, [items, filter]);

  async function saveOrder(nextFiltered: CatalogItem[]) {
    if (!items) return;
    setSaving(true);
    setError(null);

    const slugs = nextFiltered.map((item) => item.slug);
    const category = filter === 'all' ? 'all' : (filter as CatalogCategorySlug);

    try {
      const { ok, data } = await fetchJson<{ ok?: boolean; error?: string; items?: CatalogItem[] }>(
        '/api/admin/katalog/reorder',
        {
          method: 'PATCH',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slugs, category }),
        },
      );
      if (!ok || !data.ok) {
        setError(data.error || 'Не удалось сохранить порядок');
        await load();
        return;
      }
      setItems(data.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось сохранить порядок');
      await load();
    } finally {
      setSaving(false);
    }
  }

  function moveItem(from: number, to: number) {
    if (!filtered || from === to || from < 0 || to < 0 || from >= filtered.length || to >= filtered.length) {
      return;
    }
    const next = [...filtered];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    void saveOrder(next);
  }

  function handleDrop(targetIndex: number) {
    if (dragIndex === null || dragIndex === targetIndex) {
      setDragIndex(null);
      setDropIndex(null);
      return;
    }
    moveItem(dragIndex, targetIndex);
    setDragIndex(null);
    setDropIndex(null);
  }

  async function fillEmptySeo() {
    if (
      !confirm(
        'Заполнить пустые SEO-описания у максимум 3 карточек без сниппета? Цены и фото не меняются.',
      )
    )
      return;
    setFillingSeo(true);
    setError(null);
    try {
      const { ok, data } = await fetchJson<{
        ok?: boolean;
        error?: string;
        filled?: number;
        skipped?: number;
      }>('/api/admin/katalog/seo-descriptions', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ onlyEmpty: true, limit: 3 }),
      });
      if (!ok || !data.ok) {
        setError(data.error || 'Не удалось заполнить описания');
        return;
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось заполнить описания');
    } finally {
      setFillingSeo(false);
    }
  }

  async function remove(slug: string) {
    if (!confirm(`Удалить товар «${slug}»?`)) return;
    await fetch(`/api/admin/katalog/${slug}`, { method: 'DELETE' });
    load();
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl">Каталог товаров</h1>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={fillingSeo}
            onClick={() => void fillEmptySeo()}
            className="btn-secondary text-sm disabled:opacity-60"
          >
            {fillingSeo ? 'Собираем…' : 'Заполнить пустые описания'}
          </button>
          <Link href="/admin/catalog/katalog/new" className="btn-primary text-sm">
            + Новый товар
          </Link>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-4">
        <label className="text-sm text-text-muted">
          Категория:{' '}
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input ml-2 inline-block w-auto">
            <option value="all">Все</option>
            {CATALOG_CATEGORIES.map((cat) => (
              <option key={cat.slug} value={cat.slug}>
                {cat.title}
              </option>
            ))}
          </select>
        </label>
        <p className="text-xs text-text-muted">
          Перетащите строку или используйте ↑↓. Порядок на сайте = порядок в списке
          {filter !== 'all' ? ' внутри категории' : ''}.
        </p>
      </div>

      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}
      {saving ? <p className="mb-4 text-sm text-text-muted">Сохраняем порядок…</p> : null}

      {!filtered ? (
        <p className="text-text-muted">Загрузка…</p>
      ) : filtered.length === 0 ? (
        <p className="text-text-muted">Пока нет товаров в этой категории.</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((item, index) => {
            const cat = getCatalogCategory(item.category);
            const isDragging = dragIndex === index;
            const isDropTarget = dropIndex === index && dragIndex !== null && dragIndex !== index;

            return (
              <div
                key={item.slug}
                draggable={!saving}
                onDragStart={() => setDragIndex(index)}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDropIndex(index);
                }}
                onDragLeave={() => {
                  if (dropIndex === index) setDropIndex(null);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  handleDrop(index);
                }}
                onDragEnd={() => {
                  setDragIndex(null);
                  setDropIndex(null);
                }}
                className={`card flex items-center gap-3 ${
                  isDragging ? 'opacity-50' : ''
                } ${isDropTarget ? 'ring-2 ring-accent/40' : ''}`}
              >
                <div className="flex shrink-0 flex-col gap-1">
                  <button
                    type="button"
                    disabled={saving || index === 0}
                    onClick={() => moveItem(index, index - 1)}
                    className="rounded border border-border px-2 py-0.5 text-xs disabled:opacity-30"
                    aria-label="Выше"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    disabled={saving || index === filtered.length - 1}
                    onClick={() => moveItem(index, index + 1)}
                    className="rounded border border-border px-2 py-0.5 text-xs disabled:opacity-30"
                    aria-label="Ниже"
                  >
                    ↓
                  </button>
                </div>

                <div
                  className="cursor-grab select-none px-1 text-text-muted active:cursor-grabbing"
                  title="Перетащить"
                  aria-hidden
                >
                  ⠿
                </div>

                <div className="min-w-0 flex-1">
                  <p className="font-medium">{item.title}</p>
                  <p className="text-xs text-text-muted">
                    {cat?.title} · /katalog/{item.category}/{item.slug} · от {item.priceFrom.toLocaleString('ru-RU')} ₽
                    {item.seoDescription?.trim() ? ' · SEO-описание есть' : ' · SEO-описание пустое'}
                  </p>
                </div>

                <div className="flex shrink-0 gap-3 text-sm">
                  <Link href={`/admin/catalog/katalog/${item.slug}`} className="text-accent hover:underline">
                    Редактировать
                  </Link>
                  <button type="button" onClick={() => remove(item.slug)} className="text-red-600 hover:underline">
                    Удалить
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchJson } from '@/lib/fetchJson';
import { CATALOG_CATEGORIES } from '@/lib/catalogCategories';
import type { CatalogCategorySlug } from '@/lib/catalogCategories';
import type { CatalogItem } from '@/lib/content';
import MultiImageUploadField from '@/components/admin/MultiImageUploadField';
import Model3dUploadField from '@/components/admin/Model3dUploadField';
import { catalogImageDir } from '@/lib/catalogImagePaths';
import { buildProductSeoDescription, SEO_DESCRIPTION_MAX } from '@/lib/productSeoDescription';

const EMPTY: CatalogItem = {
  slug: '',
  category: 'otkrytye-besedki',
  title: '',
  material: '',
  size: '',
  roof: '',
  foundation: '',
  priceFrom: 0,
  description: '',
  images: [],
};

export default function KatalogForm({ initial }: { initial?: CatalogItem }) {
  const router = useRouter();
  const isEdit = !!initial;
  const [form, setForm] = useState<CatalogItem>(initial || EMPTY);
  const [imagesText, setImagesText] = useState((initial?.images || []).join('\n'));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const payload: CatalogItem = {
      ...form,
      priceFrom: Number(form.priceFrom) || 0,
      images: imagesText.split('\n').map((s) => s.trim()).filter(Boolean),
    };
    const url = isEdit ? `/api/admin/katalog/${initial!.slug}` : '/api/admin/katalog';
    try {
      const { ok, data } = await fetchJson<{ ok?: boolean; error?: string; item?: CatalogItem }>(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!ok || !data.ok) {
        setError(data.error || 'Не удалось сохранить');
        setSaving(false);
        return;
      }
      if (data.item?.images?.length) {
        setImagesText(data.item.images.join('\n'));
        setForm(data.item);
      }
      router.push('/admin/catalog/katalog');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось сохранить');
      setSaving(false);
    }
  }

  const imageFolder = form.slug ? catalogImageDir(form.category, form.slug) : 'proekty';

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
      <Field label="Категория">
        <select
          required
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value as CatalogCategorySlug })}
          className="input"
        >
          {CATALOG_CATEGORIES.map((cat) => (
            <option key={cat.slug} value={cat.slug}>
              {cat.title}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Slug (латиницей, для URL)">
        <input
          required
          disabled={isEdit}
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
          className="input disabled:opacity-60"
        />
      </Field>
      <Field label="Название">
        <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input" />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Материал">
          <input value={form.material} onChange={(e) => setForm({ ...form, material: e.target.value })} className="input" />
        </Field>
        <Field label="Размер">
          <input value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} className="input" />
        </Field>
        <Field label="Кровля">
          <input value={form.roof} onChange={(e) => setForm({ ...form, roof: e.target.value })} className="input" />
        </Field>
        <Field label="Фундамент">
          <input value={form.foundation} onChange={(e) => setForm({ ...form, foundation: e.target.value })} className="input" />
        </Field>
      </div>
      <Field label="Цена от, ₽">
        <input
          type="number"
          value={form.priceFrom}
          onChange={(e) => setForm({ ...form, priceFrom: Number(e.target.value) })}
          className="input"
        />
      </Field>
      <Field label="Описание">
        <textarea
          rows={4}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="input"
        />
      </Field>
      <Field label="SEO description (сниппет в поиске, до 250 знаков)">
        <textarea
          rows={3}
          maxLength={SEO_DESCRIPTION_MAX}
          value={form.seoDescription ?? ''}
          onChange={(e) => setForm({ ...form, seoDescription: e.target.value })}
          className="input"
          placeholder="Если пусто — сайт сам соберёт уникальный сниппет из названия, размера и комплектации"
        />
        <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs text-text-muted">
            {(form.seoDescription ?? '').length}/{SEO_DESCRIPTION_MAX}. Не меняет цену и фото.
          </span>
          <button
            type="button"
            className="text-xs text-accent hover:underline"
            onClick={() =>
              setForm({
                ...form,
                seoDescription: buildProductSeoDescription(form),
              })
            }
          >
            Собрать описание
          </button>
        </div>
      </Field>
      <Model3dUploadField
        label="3D модель (GLB)"
        value={form.model3d ?? ''}
        onChange={(model3d) => setForm({ ...form, model3d })}
        slug={form.slug}
        hint={
          form.slug
            ? `Файл сохранится как /models/${form.slug}.glb. Пустое поле — стандартная модель из экспорта Blender.`
            : 'Сначала укажите slug — тогда файл назовётся по slug. Иначе — случайное имя.'
        }
      />
      <MultiImageUploadField
        label="Фото"
        folder={imageFolder}
        value={imagesText}
        onChange={setImagesText}
        hint={
          form.slug
            ? `Загрузка в /images/${imageFolder}/. Имена: 01_hero, 02_front, 03_left, 04_right, 05_back. Не используйте «interior» в имени — такие файлы не показываются на сайте. Первое фото — обложка.`
            : 'Сначала укажите slug — фото загрузятся в папку модели.'
        }
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
        {saving ? 'Сохраняем…' : 'Сохранить'}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-text">{label}</span>
      {children}
    </label>
  );
}

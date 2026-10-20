'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchJson } from '@/lib/fetchJson';
import MultiImageUploadField from '@/components/admin/MultiImageUploadField';

type Project = {
  slug: string;
  title: string;
  material: string;
  size: string;
  roof: string;
  foundation: string;
  priceFrom: number;
  description: string;
  images: string[];
};

const EMPTY: Project = {
  slug: '',
  title: '',
  material: '',
  size: '',
  roof: '',
  foundation: '',
  priceFrom: 0,
  description: '',
  images: [],
};

export default function ProektyForm({ initial }: { initial?: Project }) {
  const router = useRouter();
  const isEdit = !!initial;
  const [form, setForm] = useState<Project>(initial || EMPTY);
  const [imagesText, setImagesText] = useState((initial?.images || []).join('\n'));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const payload: Project = {
      ...form,
      priceFrom: Number(form.priceFrom) || 0,
      images: imagesText.split('\n').map((s) => s.trim()).filter(Boolean),
    };
    const url = isEdit ? `/api/admin/proekty/${initial!.slug}` : '/api/admin/proekty';
    try {
      const { ok, data } = await fetchJson<{ ok?: boolean; error?: string }>(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!ok || !data.ok) {
        setError(data.error || 'Не удалось сохранить');
        setSaving(false);
        return;
      }
      router.push('/admin/catalog/proekty');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось сохранить');
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
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
      <MultiImageUploadField
        label="Фото проекта"
        folder="proekty"
        value={imagesText}
        onChange={setImagesText}
        hint="Можно загрузить несколько фото сразу. Первое фото — обложка в каталоге."
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

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchJson } from '@/lib/fetchJson';

type MaterialItem = { slug: string; title: string; summary: string; pros: string[]; cons: string[] };

const EMPTY: MaterialItem = { slug: '', title: '', summary: '', pros: [], cons: [] };

export default function MaterialyForm({ initial }: { initial?: MaterialItem }) {
  const router = useRouter();
  const isEdit = !!initial;
  const [form, setForm] = useState<MaterialItem>(initial || EMPTY);
  const [prosText, setProsText] = useState((initial?.pros || []).join('\n'));
  const [consText, setConsText] = useState((initial?.cons || []).join('\n'));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const payload: MaterialItem = {
      ...form,
      pros: prosText.split('\n').map((s) => s.trim()).filter(Boolean),
      cons: consText.split('\n').map((s) => s.trim()).filter(Boolean),
    };
    const url = isEdit ? `/api/admin/materialy/${initial!.slug}` : '/api/admin/materialy';
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
      router.push('/admin/catalog/materialy');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось сохранить');
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
      <label className="block">
        <span className="mb-1 block text-sm text-text">Slug (латиницей, для URL)</span>
        <input
          required
          disabled={isEdit}
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
          className="input disabled:opacity-60"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm text-text">Название</span>
        <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input" />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm text-text">Краткое описание</span>
        <textarea rows={3} value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} className="input" />
      </label>
      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className="mb-1 block text-sm text-text">Плюсы — по одному на строку</span>
          <textarea rows={4} value={prosText} onChange={(e) => setProsText(e.target.value)} className="input" />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-text">Минусы — по одному на строку</span>
          <textarea rows={4} value={consText} onChange={(e) => setConsText(e.target.value)} className="input" />
        </label>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
        {saving ? 'Сохраняем…' : 'Сохранить'}
      </button>
    </form>
  );
}

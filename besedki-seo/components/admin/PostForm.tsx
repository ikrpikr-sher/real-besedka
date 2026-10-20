'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchJson } from '@/lib/fetchJson';
import ImageUploadField from '@/components/admin/ImageUploadField';
import MultiVideoUploadField from '@/components/admin/MultiVideoUploadField';
import { getPostVideos } from '@/lib/postVideos';

type FaqItem = { question: string; answer: string };

type Post = {
  slug: string;
  title: string;
  description: string;
  date: string;
  updated?: string;
  author: string;
  authorRole?: string;
  category: string;
  tags: string[];
  coverImage?: string;
  videoUrl?: string;
  videoUrls?: string[];
  faq?: FaqItem[];
  content: string;
};

const EMPTY: Post = {
  slug: '',
  title: '',
  description: '',
  date: new Date().toISOString().slice(0, 10),
  updated: '',
  author: '',
  authorRole: '',
  category: 'kak-vybrat',
  tags: [],
  faq: [],
  content: '',
};

const CATEGORIES = ['kak-vybrat', 'sravneniya', 'proekty-i-idei', 'montazh-i-uhod', 'stili'];

export default function PostForm({ initial }: { initial?: Post }) {
  const router = useRouter();
  const isEdit = !!initial;
  const [form, setForm] = useState<Post>(initial || EMPTY);
  const [videoUrls, setVideoUrls] = useState<string[]>(() => (initial ? getPostVideos(initial) : []));
  const [tagsText, setTagsText] = useState((initial?.tags || []).join(', '));
  const [faq, setFaq] = useState<FaqItem[]>(initial?.faq || []);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function updateFaq(idx: number, field: keyof FaqItem, value: string) {
    setFaq((prev) => prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const { videoUrl: _legacyVideoUrl, ...formFields } = form;
    const payload = {
      ...formFields,
      tags: tagsText.split(',').map((s) => s.trim()).filter(Boolean),
      faq: faq.filter((f) => f.question.trim() && f.answer.trim()),
      updated: form.updated || undefined,
      authorRole: form.authorRole || undefined,
      coverImage: form.coverImage || undefined,
      videoUrls: videoUrls.length ? videoUrls : undefined,
    };
    const url = isEdit ? `/api/admin/posts/${initial!.slug}` : '/api/admin/posts';
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
      router.push('/admin/blog');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось сохранить');
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-4">
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
        <span className="mb-1 block text-sm text-text">Заголовок</span>
        <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input" />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm text-text">Описание (для SEO и превью)</span>
        <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input" />
      </label>
      <ImageUploadField
        label="Обложка статьи"
        folder="blog"
        value={form.coverImage || ''}
        onChange={(coverImage) => setForm({ ...form, coverImage })}
        hint="Загрузите фото или укажите путь вручную. Рекомендуемый размер: 1380×720."
      />
      <MultiVideoUploadField
        label="Видео к статье (до 3 шт.)"
        folder="blog"
        value={videoUrls}
        onChange={setVideoUrls}
        hint="На сайте видео показываются сверху вниз: сначала №1, затем №2 и №3. MP4/MOV до 500 МБ или ссылка Rutube/YouTube/VK. После загрузки обязательно нажмите «Сохранить» внизу формы — иначе ссылка на видео не попадёт в статью."
      />
      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className="mb-1 block text-sm text-text">Дата публикации</span>
          <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="input" />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-text">Дата обновления (необязательно)</span>
          <input type="date" value={form.updated || ''} onChange={(e) => setForm({ ...form, updated: e.target.value })} className="input" />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-text">Автор</span>
          <input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} className="input" />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-text">Роль автора</span>
          <input value={form.authorRole || ''} onChange={(e) => setForm({ ...form, authorRole: e.target.value })} className="input" />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-text">Категория</span>
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input">
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-text">Теги (через запятую)</span>
          <input value={tagsText} onChange={(e) => setTagsText(e.target.value)} className="input" />
        </label>
      </div>
      <label className="block">
        <span className="mb-1 block text-sm text-text">Текст статьи (Markdown/MDX)</span>
        <textarea
          rows={16}
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          className="input font-mono text-sm"
        />
      </label>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm text-text">FAQ</span>
          <button
            type="button"
            onClick={() => setFaq([...faq, { question: '', answer: '' }])}
            className="text-xs text-accent hover:underline"
          >
            + Добавить вопрос
          </button>
        </div>
        <div className="space-y-3">
          {faq.map((item, idx) => (
            <div key={idx} className="card space-y-2">
              <input
                placeholder="Вопрос"
                value={item.question}
                onChange={(e) => updateFaq(idx, 'question', e.target.value)}
                className="input"
              />
              <textarea
                placeholder="Ответ"
                rows={2}
                value={item.answer}
                onChange={(e) => updateFaq(idx, 'answer', e.target.value)}
                className="input"
              />
              <button
                type="button"
                onClick={() => setFaq(faq.filter((_, i) => i !== idx))}
                className="text-xs text-red-600 hover:underline"
              >
                Удалить вопрос
              </button>
            </div>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
        {saving ? 'Сохраняем…' : 'Сохранить'}
      </button>
    </form>
  );
}

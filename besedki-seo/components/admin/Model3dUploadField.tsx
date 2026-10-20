'use client';

import dynamic from 'next/dynamic';
import { useRef, useState } from 'react';
import { uploadAdminModel3d } from '@/lib/clientUpload';

const ProductModelViewer = dynamic(() => import('@/components/ProductModelViewer'), {
  ssr: false,
  loading: () => (
    <div className="flex aspect-[4/3] items-center justify-center rounded-lg border border-border bg-surface text-xs text-text-muted">
      Загружаем превью…
    </div>
  ),
});

type Props = {
  label: string;
  value: string;
  onChange: (path: string) => void;
  slug?: string;
  hint?: string;
};

export default function Model3dUploadField({ label, value, onChange, slug, hint }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  async function handleFile(file: File | null) {
    if (!file) return;

    const ext = file.name.toLowerCase();
    if (ext.endsWith('.blend1') || ext.endsWith('.blend2')) {
      setError('Это резервная копия Blender (.blend1). Выберите основной файл .blend');
      return;
    }

    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      const path = await uploadAdminModel3d(file, slug, setProgress);
      onChange(path);
      setShowPreview(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div className="space-y-2">
      <span className="block text-sm text-text">{label}</span>
      {hint && <p className="text-xs text-text-muted">{hint}</p>}

      <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950">
        <strong>На сайте показывается только GLB.</strong> Загрузите готовый <code>.glb</code> или{' '}
        <code>.blend</code> (конвертируется автоматически, если на сервере установлен Blender).
        <br />
        Экспорт в Blender: <strong>File → Export → glTF 2.0 (.glb)</strong>
      </div>

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="/models/b-11.glb — пусто = авто из catalog-models.json"
        className="input font-mono text-sm"
      />

      {value && (
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <a href={value} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
            Открыть GLB
          </a>
          <button type="button" onClick={() => setShowPreview((v) => !v)} className="text-accent hover:underline">
            {showPreview ? 'Скрыть превью' : 'Превью 3D'}
          </button>
        </div>
      )}

      {value && showPreview && <ProductModelViewer src={value} alt="Превью 3D модели" />}

      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept=".glb,.gltf,.blend"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0] || null)}
        />
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="btn-secondary disabled:opacity-60"
        >
          {uploading
            ? progress < 100
              ? `Загружаем… ${progress}%`
              : 'Конвертируем в GLB…'
            : 'Загрузить GLB / .blend'}
        </button>
        {value && (
          <button type="button" onClick={() => onChange('')} className="text-sm text-red-600 hover:underline">
            Убрать (авто-модель)
          </button>
        )}
      </div>

      {uploading && (
        <div className="h-1.5 overflow-hidden rounded-full bg-border">
          <div className="h-full bg-accent transition-all" style={{ width: `${Math.max(progress, 5)}%` }} />
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

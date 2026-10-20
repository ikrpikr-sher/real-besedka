'use client';

import { useRef, useState } from 'react';
import { uploadAdminImage } from '@/lib/clientUpload';
import type { UploadFolder } from '@/lib/uploadFolders';

type Props = {
  label: string;
  folder: UploadFolder;
  value: string;
  onChange: (path: string) => void;
  hint?: string;
};

export default function ImageUploadField({ label, folder, value, onChange, hint }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | null) {
    if (!file) return;
    setUploading(true);
    setError(null);

    try {
      const path = await uploadAdminImage(file, folder);
      onChange(path);
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
      {hint && <p className="text-xs text-text/70">{hint}</p>}

      {value && (
        <div className="overflow-hidden rounded-lg border border-border bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="max-h-48 w-full object-cover" />
        </div>
      )}

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="/images/blog/example.png"
        className="input"
      />

      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0] || null)}
        />
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="btn-secondary disabled:opacity-60"
        >
          {uploading ? 'Загружаем…' : 'Загрузить фото'}
        </button>
        {value && (
          <button type="button" onClick={() => onChange('')} className="text-sm text-red-600 hover:underline">
            Убрать
          </button>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

'use client';

import { useRef, useState } from 'react';
import { uploadAdminVideo } from '@/lib/clientUpload';
import { parseVideoUrl } from '@/lib/videoEmbed';
import type { UploadFolder } from '@/lib/uploadFolders';

type Props = {
  label: string;
  folder: UploadFolder;
  value: string;
  onChange: (url: string) => void;
  hint?: string;
};

export default function VideoUploadField({ label, folder, value, onChange, hint }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const embed = value ? parseVideoUrl(value) : null;

  const maxBytes = 500 * 1024 * 1024;

  async function handleFile(file: File | null) {
    if (!file) return;
    if (file.size > maxBytes) {
      setError('Видео больше 500 МБ. Сожмите файл или загрузите на Rutube и вставьте ссылку.');
      return;
    }
    setUploading(true);
    setError(null);

    try {
      const path = await uploadAdminVideo(file, folder);
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

      {embed?.kind === 'file' && (
        <div className="overflow-hidden rounded-lg border border-border bg-black">
          <video src={embed.src} controls playsInline preload="metadata" className="max-h-48 w-full" />
        </div>
      )}

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Ссылка Rutube/YouTube/VK или /videos/blog/file.mp4"
        className="input"
      />

      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0] || null)}
        />
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="btn-secondary disabled:opacity-60"
        >
          {uploading ? 'Загружаем…' : 'Загрузить видео'}
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

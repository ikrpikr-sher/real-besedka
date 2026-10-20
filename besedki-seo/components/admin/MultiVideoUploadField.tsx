'use client';

import { useRef, useState } from 'react';
import { uploadAdminVideo } from '@/lib/clientUpload';
import { parseVideoUrl, posterPathForVideo } from '@/lib/videoEmbed';
import type { UploadFolder } from '@/lib/uploadFolders';

const MAX_VIDEOS = 3;
const maxBytes = 500 * 1024 * 1024;

type Props = {
  label: string;
  folder: UploadFolder;
  value: string[];
  onChange: (urls: string[]) => void;
  hint?: string;
};

type UploadState = {
  index: number;
  percent: number;
  phase: 'upload' | 'processing';
};

function slotsFromUrls(urls: string[]): string[] {
  const cleaned = urls.map((url) => url.trim()).filter(Boolean).slice(0, MAX_VIDEOS);
  const slots = Array.from({ length: MAX_VIDEOS }, () => '');
  cleaned.forEach((url, index) => {
    slots[index] = url;
  });
  return slots;
}

export default function MultiVideoUploadField({ label, folder, value, onChange, hint }: Props) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [upload, setUpload] = useState<UploadState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedHint, setSavedHint] = useState<string | null>(null);
  const slots = slotsFromUrls(value);

  function commitSlots(nextSlots: string[]) {
    onChange(nextSlots.map((item) => item.trim()).filter(Boolean));
  }

  function updateSlot(index: number, url: string) {
    const next = [...slots];
    next[index] = url;
    commitSlots(next);
  }

  function clearSlot(index: number) {
    updateSlot(index, '');
  }

  async function handleFile(index: number, file: File | null) {
    if (!file) return;
    if (file.size > maxBytes) {
      setError('Видео больше 500 МБ. Сожмите файл или загрузите на Rutube и вставьте ссылку.');
      return;
    }

    setUpload({ index, percent: 0, phase: 'upload' });
    setError(null);
    setSavedHint(null);

    try {
      const path = await uploadAdminVideo(file, folder, (percent, phase) => {
        setUpload({ index, percent, phase });
      });
      updateSlot(index, path);
      setSavedHint('Видео загружено на сервер. Нажмите «Сохранить» внизу формы, чтобы оно появилось на сайте.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить');
    } finally {
      setUpload(null);
      if (inputRefs.current[index]) inputRefs.current[index]!.value = '';
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <span className="block text-sm text-text">{label}</span>
        {hint && <p className="mt-1 text-xs text-text/70">{hint}</p>}
      </div>

      {slots.map((url, index) => {
        const embed = url ? parseVideoUrl(url) : null;
        const isUploading = upload?.index === index;
        const poster = url ? posterPathForVideo(url) : '';

        return (
          <div key={index} className="card space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-text">Видео {index + 1}</span>
              {url ? (
                <button type="button" onClick={() => clearSlot(index)} className="text-xs text-red-600 hover:underline">
                  Убрать
                </button>
              ) : null}
            </div>

            {embed?.kind === 'file' && !isUploading ? (
              <div className="overflow-hidden rounded-lg border border-border bg-black">
                <video
                  src={embed.src}
                  poster={poster || undefined}
                  controls
                  playsInline
                  preload="none"
                  className="max-h-40 w-full"
                />
              </div>
            ) : null}

            {isUploading ? (
              <div className="space-y-1">
                <div className="h-2 overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full bg-accent transition-all duration-300"
                    style={{ width: `${upload.percent}%` }}
                  />
                </div>
                <p className="text-xs text-text-muted">
                  {upload.phase === 'processing'
                    ? 'Сжимаем видео для быстрой загрузки на сайте…'
                    : `Загрузка на сервер… ${upload.percent}%`}
                </p>
              </div>
            ) : null}

            <input
              value={url}
              onChange={(e) => updateSlot(index, e.target.value)}
              placeholder="Ссылка Rutube/YouTube/VK или /videos/blog/file.mp4"
              className="input"
              disabled={isUploading}
            />

            <div>
              <input
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="file"
                accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
                className="hidden"
                onChange={(e) => handleFile(index, e.target.files?.[0] || null)}
              />
              <button
                type="button"
                disabled={!!upload}
                onClick={() => inputRefs.current[index]?.click()}
                className="btn-secondary disabled:opacity-60"
              >
                {isUploading ? 'Загружаем…' : 'Загрузить видео'}
              </button>
            </div>
          </div>
        );
      })}

      {savedHint && <p className="text-sm text-accent">{savedHint}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

'use client';

import { useRef, useState } from 'react';
import { uploadAdminImage } from '@/lib/clientUpload';
import type { UploadFolder } from '@/lib/uploadFolders';

type ImageUploadFolder = UploadFolder | string;

type Props = {
  label: string;
  folder: ImageUploadFolder;
  value: string;
  onChange: (text: string) => void;
  hint?: string;
};

function parsePaths(value: string): string[] {
  return value
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function MultiImageUploadField({ label, folder, value, onChange, hint }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  const paths = parsePaths(value);

  function setPaths(next: string[]) {
    onChange(next.join('\n'));
  }

  function movePath(from: number, to: number) {
    if (from === to || from < 0 || to < 0 || from >= paths.length || to >= paths.length) return;
    const next = [...paths];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    setPaths(next);
  }

  async function handleFiles(fileList: FileList | null) {
    if (!fileList?.length) return;
    setUploading(true);
    setError(null);

    try {
      const uploaded: string[] = [];
      for (const file of Array.from(fileList)) {
        uploaded.push(await uploadAdminImage(file, folder));
      }
      setPaths([...paths, ...uploaded]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  function removePath(path: string) {
    setPaths(paths.filter((p) => p !== path));
  }

  function handleDrop(targetIndex: number) {
    if (dragIndex === null || dragIndex === targetIndex) {
      setDragIndex(null);
      setDropIndex(null);
      return;
    }
    movePath(dragIndex, targetIndex);
    setDragIndex(null);
    setDropIndex(null);
  }

  return (
    <div className="space-y-2">
      <span className="block text-sm text-text">{label}</span>
      {hint && <p className="text-xs text-text/70">{hint}</p>}

      {paths.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {paths.map((path, index) => {
            const isDragging = dragIndex === index;
            const isDropTarget = dropIndex === index && dragIndex !== null && dragIndex !== index;

            return (
              <div
                key={`${path}-${index}`}
                draggable
                onDragStart={() => setDragIndex(index)}
                onDragEnd={() => {
                  setDragIndex(null);
                  setDropIndex(null);
                }}
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
                className={`overflow-hidden rounded-lg border bg-white transition-shadow ${
                  isDragging ? 'border-accent opacity-60 shadow-lg' : 'border-border'
                } ${isDropTarget ? 'ring-2 ring-accent ring-offset-2' : ''}`}
              >
                <div className="flex items-center justify-between gap-2 border-b border-border bg-surface px-2 py-1.5">
                  <span className="text-xs font-medium text-text-muted">
                    {index === 0 ? 'Обложка' : `Фото ${index + 1}`}
                  </span>
                  <span className="cursor-grab select-none text-xs text-text-muted active:cursor-grabbing" title="Перетащите для смены порядка">
                    ⋮⋮
                  </span>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={path} alt="" className="aspect-[4/3] w-full object-cover" draggable={false} />
                <div className="space-y-2 p-2">
                  <code className="block truncate text-[10px] text-text/70">{path}</code>
                  <div className="flex flex-wrap items-center gap-1">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => movePath(index, index - 1)}
                      className="rounded border border-border px-2 py-1 text-xs hover:bg-surface disabled:opacity-40"
                      title="Сдвинуть влево / вверх"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      disabled={index === paths.length - 1}
                      onClick={() => movePath(index, index + 1)}
                      className="rounded border border-border px-2 py-1 text-xs hover:bg-surface disabled:opacity-40"
                      title="Сдвинуть вправо / вниз"
                    >
                      →
                    </button>
                    <button
                      type="button"
                      onClick={() => removePath(path)}
                      className="ml-auto text-xs text-red-600 hover:underline"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {paths.length > 1 && (
        <p className="text-xs text-text-muted">
          Перетащите карточки или используйте стрелки ← →, чтобы изменить порядок. Первое фото — обложка в каталоге.
        </p>
      )}

      <details className="rounded-DEFAULT border border-border">
        <summary className="cursor-pointer px-3 py-2 text-sm text-text-muted">Список путей (для ручного редактирования)</summary>
        <textarea
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="input rounded-none border-0 border-t font-mono text-sm"
        />
      </details>

      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="btn-secondary disabled:opacity-60"
        >
          {uploading ? 'Загружаем…' : 'Загрузить фото'}
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

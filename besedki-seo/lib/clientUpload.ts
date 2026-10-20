import { fetchJson } from '@/lib/fetchJson';
import type { UploadFolder } from '@/lib/uploadFolders';

type ImageUploadFolder = UploadFolder | string;
type UploadResponse = { ok?: boolean; error?: string; path?: string };

export async function uploadAdminImage(file: File, folder: ImageUploadFolder): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  form.append('folder', folder);

  const { ok, status, data } = await fetchJson<UploadResponse>('/api/admin/upload', {
    method: 'POST',
    body: form,
    credentials: 'same-origin',
  });

  if (!ok || !data.ok || !data.path) {
    throw new Error(data.error || `Не удалось загрузить (${status})`);
  }

  return data.path;
}

export async function uploadAdminVideo(
  file: File,
  folder: UploadFolder,
  onProgress?: (percent: number, phase: 'upload' | 'processing') => void,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const form = new FormData();
    form.append('file', file);
    form.append('folder', folder);
    form.append('kind', 'video');

    xhr.upload.addEventListener('progress', (event) => {
      if (!onProgress) return;
      if (!event.lengthComputable) return;
      if (event.loaded >= event.total) {
        onProgress(99, 'processing');
        return;
      }
      const percent = Math.round((event.loaded / event.total) * 90);
      onProgress(percent, 'upload');
    });

    xhr.addEventListener('load', () => {
      const contentType = xhr.getResponseHeader('content-type') || '';
      if (!contentType.includes('application/json')) {
        reject(new Error(xhr.status === 413 ? 'Файл слишком большой для загрузки' : `Ошибка сервера (${xhr.status})`));
        return;
      }

      try {
        const data = JSON.parse(xhr.responseText) as UploadResponse;
        if (xhr.status >= 200 && xhr.status < 300 && data.ok && data.path) {
          onProgress?.(100, 'processing');
          resolve(data.path);
          return;
        }
        reject(new Error(data.error || `Не удалось загрузить (${xhr.status})`));
      } catch {
        reject(new Error('Неверный ответ сервера'));
      }
    });

    xhr.addEventListener('error', () => reject(new Error('Сеть недоступна')));
    xhr.addEventListener('abort', () => reject(new Error('Загрузка отменена')));

    xhr.open('POST', '/api/admin/upload');
    xhr.withCredentials = true;
    onProgress?.(0, 'upload');
    xhr.send(form);
  });
}

export async function uploadAdminModel3d(
  file: File,
  slug?: string,
  onProgress?: (percent: number) => void,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const form = new FormData();
    form.append('file', file);
    form.append('kind', 'model3d');
    if (slug?.trim()) form.append('slug', slug.trim());

    xhr.upload.addEventListener('progress', (event) => {
      if (!onProgress || !event.lengthComputable) return;
      const percent = Math.round((event.loaded / event.total) * 100);
      onProgress(percent);
    });

    xhr.addEventListener('load', () => {
      const contentType = xhr.getResponseHeader('content-type') || '';
      if (!contentType.includes('application/json')) {
        reject(new Error(xhr.status === 413 ? 'Файл слишком большой для загрузки' : `Ошибка сервера (${xhr.status})`));
        return;
      }

      try {
        const data = JSON.parse(xhr.responseText) as UploadResponse;
        if (xhr.status >= 200 && xhr.status < 300 && data.ok && data.path) {
          onProgress?.(100);
          resolve(data.path);
          return;
        }
        reject(new Error(data.error || `Не удалось загрузить (${xhr.status})`));
      } catch {
        reject(new Error('Неверный ответ сервера'));
      }
    });

    xhr.addEventListener('error', () => reject(new Error('Сеть недоступна')));
    xhr.addEventListener('abort', () => reject(new Error('Загрузка отменена')));

    xhr.open('POST', '/api/admin/upload');
    xhr.withCredentials = true;
    onProgress?.(0);
    xhr.send(form);
  });
}

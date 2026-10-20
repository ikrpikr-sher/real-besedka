import fs from 'node:fs';
import { createWriteStream } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import { Readable } from 'node:stream';
import { convertBlendFileToGlb } from '@/lib/blenderConvert';
import { applyWatermarkToFile } from '@/lib/imageWatermark';
import { isAllowedImageFolder, isUploadFolder, type UploadFolder } from '@/lib/uploadFolders';
import { expectedOptimizedVideoPath, optimizeVideoFileAsync } from '@/lib/videoOptimize';

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const MAX_BYTES = 15 * 1024 * 1024;

const EXT_TO_MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
};

export function isAllowedUploadFolder(folder: string): folder is UploadFolder {
  return isUploadFolder(folder);
}

export function isAllowedImageUploadFolder(folder: string): boolean {
  return isAllowedImageFolder(folder);
}

const BLOCKED_UPLOAD_BASENAME = /interior|07_interior|08_panels|09_uzel|10_uzel|11_uzel|spec-interior|paneli\.jpg|mangal\.jpg|interior-/i;

export function sanitizeUploadFilename(name: string): string {
  const ext = path.extname(name).toLowerCase().replace(/[^a-z0-9.]/g, '');
  let base = path
    .basename(name, path.extname(name))
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  if (BLOCKED_UPLOAD_BASENAME.test(base)) {
    base = `yard-${base.replace(/^interior-?/i, '').replace(/-+/g, '-')}`.slice(0, 80);
  }
  const safeExt = ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext) ? ext : '.jpg';
  const stamp = Date.now().toString(36);
  return `${base || 'image'}-${stamp}${safeExt}`;
}

function resolveMime(filename: string, mime: string): string {
  if (mime && ALLOWED_MIME.has(mime)) return mime;
  const fromExt = EXT_TO_MIME[path.extname(filename).toLowerCase()];
  return fromExt || mime;
}

async function streamFileToDisk(file: File, targetPath: string): Promise<void> {
  const webStream = file.stream();
  const nodeStream = Readable.fromWeb(webStream as import('stream/web').ReadableStream);
  await pipeline(nodeStream, createWriteStream(targetPath));
  fs.chmodSync(targetPath, 0o664);
}

export async function saveUploadedImage(
  folder: string,
  filename: string,
  file: File,
): Promise<string> {
  const resolvedMime = resolveMime(filename, file.type || '');
  if (!ALLOWED_MIME.has(resolvedMime)) {
    throw new Error('Допустимы только JPG, PNG, WebP и GIF');
  }
  if (file.size > MAX_BYTES) {
    throw new Error('Файл слишком большой (максимум 15 МБ)');
  }

  const dir = path.join(process.cwd(), 'public', 'images', folder);
  fs.mkdirSync(dir, { recursive: true });

  const safeName = sanitizeUploadFilename(filename);
  const target = path.join(dir, safeName);
  await streamFileToDisk(file, target);

  try {
    await applyWatermarkToFile(target);
  } catch (err) {
    console.error('[watermark] upload:', target, err);
  }

  return `/images/${folder}/${safeName}`;
}

const VIDEO_MIME = new Set(['video/mp4', 'video/webm', 'video/quicktime']);
const VIDEO_EXT = ['.mp4', '.webm', '.mov'];
const MAX_VIDEO_BYTES = 500 * 1024 * 1024;

function sanitizeVideoBasename(name: string): string {
  const base = path
    .basename(name, path.extname(name))
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  const stamp = Date.now().toString(36);
  return `${base || 'video'}-${stamp}`;
}

function resolveVideoMime(filename: string, mime: string): string {
  if (mime && VIDEO_MIME.has(mime)) return mime;
  const ext = path.extname(filename).toLowerCase();
  if (ext === '.webm') return 'video/webm';
  if (ext === '.mov') return 'video/quicktime';
  return 'video/mp4';
}

export async function saveUploadedVideo(
  folder: UploadFolder,
  filename: string,
  file: File,
): Promise<{ path: string; processing: boolean }> {
  const resolvedMime = resolveVideoMime(filename, file.type || '');
  if (!VIDEO_MIME.has(resolvedMime)) {
    throw new Error('Допустимы только MP4, WebM и MOV');
  }
  if (file.size > MAX_VIDEO_BYTES) {
    throw new Error('Видео слишком большое (максимум 500 МБ)');
  }

  const dir = path.join(process.cwd(), 'public', 'videos', folder);
  fs.mkdirSync(dir, { recursive: true });

  const ext = path.extname(filename).toLowerCase();
  const safeExt = VIDEO_EXT.includes(ext) ? ext : '.mp4';
  const safeName = `${sanitizeVideoBasename(filename)}${safeExt}`;
  const target = path.join(dir, safeName);

  await streamFileToDisk(file, target);

  const optimizedPath = expectedOptimizedVideoPath(target);
  const publicPath = `/videos/${folder}/${path.basename(optimizedPath)}`;

  void optimizeVideoFileAsync(target).catch((err) => {
    console.error('[video-optimize] background failed:', target, err);
  });

  return { path: publicPath, processing: true };
}

const MODEL3D_MIME = new Set(['model/gltf-binary', 'model/gltf+json', 'application/octet-stream']);
const MODEL3D_EXT = ['.glb', '.gltf', '.blend'];
const MAX_MODEL3D_BYTES = 50 * 1024 * 1024;
const MAX_BLEND_BYTES = 120 * 1024 * 1024;

function sanitizeModelSlug(slug: string): string {
  return slug
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function sanitizeModelFilename(name: string): string {
  const ext = path.extname(name).toLowerCase();
  const safeExt = MODEL3D_EXT.includes(ext) ? ext : '.glb';
  const base = path
    .basename(name, path.extname(name))
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  const stamp = Date.now().toString(36);
  return `${base || 'model'}-${stamp}${safeExt}`;
}

function resolveModel3dMime(filename: string, mime: string): string {
  const ext = path.extname(filename).toLowerCase();
  if (ext === '.gltf') return 'model/gltf+json';
  if (mime && MODEL3D_MIME.has(mime)) return mime;
  return 'model/gltf-binary';
}

export async function saveUploadedModel3d(
  filename: string,
  file: File,
  preferredSlug?: string,
): Promise<string> {
  const ext = path.extname(filename).toLowerCase();
  if (!MODEL3D_EXT.includes(ext)) {
    throw new Error('Допустимы GLB, GLTF и BLEND (.blend конвертируется в GLB, если на сервере есть Blender)');
  }

  const maxBytes = ext === '.blend' ? MAX_BLEND_BYTES : MAX_MODEL3D_BYTES;
  if (file.size > maxBytes) {
    throw new Error(`Файл слишком большой (максимум ${Math.round(maxBytes / 1024 / 1024)} МБ)`);
  }

  const dir = path.join(process.cwd(), 'public', 'models');
  fs.mkdirSync(dir, { recursive: true });

  const glbName = preferredSlug
    ? `${sanitizeModelSlug(preferredSlug)}.glb`
    : sanitizeModelFilename(filename.replace(/\.blend$/i, '.glb'));
  const glbTarget = path.join(dir, glbName);

  if (ext === '.blend') {
    const tmpBlend = path.join(os.tmpdir(), `besedki-${Date.now()}${ext}`);
    await streamFileToDisk(file, tmpBlend);
    try {
      await convertBlendFileToGlb(tmpBlend, glbTarget);
    } finally {
      try {
        fs.unlinkSync(tmpBlend);
      } catch {
        /* ignore */
      }
    }
    return `/models/${glbName}`;
  }

  resolveModel3dMime(filename, file.type || '');

  const safeName = preferredSlug
    ? `${sanitizeModelSlug(preferredSlug)}${ext === '.gltf' ? '.gltf' : '.glb'}`
    : sanitizeModelFilename(filename);
  const target = path.join(dir, safeName);

  await streamFileToDisk(file, target);

  return `/models/${safeName}`;
}

import fs from 'node:fs';
import path from 'node:path';
import type { CatalogItem } from '@/lib/content';
import catalogModelsConfig from '@/data/catalog-models.json';

/** Путь к GLB по slug, если нет поля model3d в карточке товара. */
export const CATALOG_MODEL_SOURCES: Record<string, string> = Object.fromEntries(
  Object.keys(catalogModelsConfig.models).map((slug) => [slug, `/models/${slug}.glb`]),
);

export const CATALOG_MODEL_SLUGS = Object.keys(catalogModelsConfig.models);

function withModelCacheBust(url: string): string {
  const relative = url.replace(/^\//, '').split('?')[0];
  const filePath = path.join(process.cwd(), 'public', relative);
  try {
    const mtime = fs.statSync(filePath).mtimeMs;
    return `${url.split('?')[0]}?v=${Math.floor(mtime)}`;
  } catch {
    return url.split('?')[0];
  }
}

export function getProductModel3dUrl(item: CatalogItem): string | undefined {
  const base = item.model3d?.trim() || CATALOG_MODEL_SOURCES[item.slug];
  if (!base) return undefined;
  return withModelCacheBust(base);
}

export function productHasModel3d(item: CatalogItem): boolean {
  return Boolean(item.model3d?.trim() || CATALOG_MODEL_SOURCES[item.slug]);
}

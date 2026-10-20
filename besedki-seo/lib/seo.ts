import { readJsonSafe, writeJson } from './contentStore';

export type SeoEntry = { title: string; description: string };
export type SeoMap = Record<string, SeoEntry>;

const SEO_FILE = 'seo.json';

export function readSeoMap(): SeoMap {
  return readJsonSafe<SeoMap>(SEO_FILE, {});
}

/** Берёт переопределение title/description для route из data/seo.json, иначе — fallback, зашитый в коде страницы. */
export function getSeo(route: string, fallback: SeoEntry): SeoEntry {
  const map = readSeoMap();
  const override = map[route];
  return {
    title: override?.title?.trim() ? override.title : fallback.title,
    description: override?.description?.trim() ? override.description : fallback.description,
  };
}

export function setSeo(route: string, entry: SeoEntry): void {
  const map = readSeoMap();
  map[route] = entry;
  writeJson(SEO_FILE, map);
}

export { SEO_ROUTES } from './seoRoutes';

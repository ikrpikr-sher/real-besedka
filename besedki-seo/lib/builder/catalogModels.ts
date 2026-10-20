import catalogModels from '@/data/catalog-models.json';

const MODEL_PATHS: Record<string, string> = Object.fromEntries(
  Object.keys(catalogModels.models ?? {}).map((slug) => [slug, `/models/${slug}.glb`]),
);

export function getProductModel3dUrlFromSlug(slug: string): string | undefined {
  return MODEL_PATHS[slug];
}

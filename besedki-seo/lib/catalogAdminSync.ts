import { revalidatePath } from 'next/cache';
import { clearCatalogCache } from '@/lib/content';
import type { CatalogCategorySlug } from '@/lib/catalogCategories';

/** Сброс кэша и обновление страниц каталога после правок в админке. */
export function syncCatalogAfterAdminChange(item?: {
  category: CatalogCategorySlug;
  slug: string;
}): void {
  clearCatalogCache();
  revalidatePath('/');
  revalidatePath('/katalog');
  if (item) {
    revalidatePath(`/katalog/${item.category}`);
    revalidatePath(`/katalog/${item.category}/${item.slug}`);
  }
}

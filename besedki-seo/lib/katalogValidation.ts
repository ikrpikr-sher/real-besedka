import fs from 'node:fs';
import path from 'node:path';
import { CATALOG_CATEGORIES, isCatalogCategory, isUnpublishedCatalogCategory } from '@/lib/catalogCategories';
import type { CatalogItem } from '@/lib/content';

const VALID_CATEGORIES = new Set(CATALOG_CATEGORIES.map((c) => c.slug));
const BAD_IMAGE_PATTERNS = [
  /interior/i,
  /07_interior/i,
  /08_panels/i,
  /09_uzel/i,
  /10_uzel/i,
  /11_uzel/i,
  /spec-interior/i,
];

export type KatalogValidationIssue = {
  level: 'error' | 'warn';
  slug?: string;
  message: string;
};

export function validateCatalogItems(items: unknown): KatalogValidationIssue[] {
  const issues: KatalogValidationIssue[] = [];

  if (!Array.isArray(items)) {
    return [{ level: 'error', message: 'katalog.json должен быть массивом' }];
  }

  const slugs = new Set<string>();

  for (const raw of items) {
    const item = raw as Partial<CatalogItem>;
    const slug = item.slug?.trim();

    if (!slug) {
      issues.push({ level: 'error', message: 'Товар без slug' });
      continue;
    }

    if (slugs.has(slug)) {
      issues.push({ level: 'error', slug, message: `Дубликат slug: ${slug}` });
    }
    slugs.add(slug);

    if (!item.title?.trim()) {
      issues.push({ level: 'error', slug, message: 'Пустой title' });
    }

    if (!item.category || (!isCatalogCategory(item.category) && !isUnpublishedCatalogCategory(String(item.category)))) {
      issues.push({ level: 'error', slug, message: `Неизвестная категория: ${String(item.category)}` });
    } else if (!isCatalogCategory(item.category)) {
      issues.push({ level: 'warn', slug, message: `Черновик категории, не витрина: ${item.category}` });
    } else if (!VALID_CATEGORIES.has(item.category)) {
      issues.push({ level: 'warn', slug, message: `Категория не в списке: ${item.category}` });
    }

    if (typeof item.priceFrom !== 'number' || Number.isNaN(item.priceFrom)) {
      issues.push({ level: 'error', slug, message: 'priceFrom должен быть числом' });
    } else if (item.priceFrom <= 0) {
      issues.push({ level: 'warn', slug, message: 'priceFrom = 0 — проверьте цену' });
    }

    if (!Array.isArray(item.images)) {
      issues.push({ level: 'error', slug, message: 'images должен быть массивом' });
    } else {
      if (item.images.length === 0) {
        issues.push({ level: 'warn', slug, message: 'Нет фото' });
      }
      for (const img of item.images) {
        if (typeof img !== 'string' || !img.trim()) {
          issues.push({ level: 'error', slug, message: 'Пустой путь к фото' });
          continue;
        }
        for (const pattern of BAD_IMAGE_PATTERNS) {
          if (pattern.test(img)) {
            issues.push({
              level: 'warn',
              slug,
              message: `Подозрительное фото (интерьер/узлы): ${img}`,
            });
          }
        }
      }
    }
  }

  return issues;
}

export function assertCatalogWritable(next: CatalogItem[], previous: CatalogItem[]): void {
  const issues = validateCatalogItems(next);
  const errors = issues.filter((i) => i.level === 'error');
  if (errors.length) {
    const preview = errors
      .slice(0, 5)
      .map((e) => (e.slug ? `${e.slug}: ${e.message}` : e.message))
      .join('; ');
    throw new Error(`katalog.json не прошёл проверку: ${preview}`);
  }

  if (previous.length >= 5 && next.length < previous.length - 1) {
    throw new Error(
      `Запись заблокирована: каталог сократился ${previous.length} → ${next.length}. ` +
        'Удаляйте товары по одному через админку или задайте KATALOG_ALLOW_SHRINK=1.',
    );
  }
}

/** Проверяет, что файлы из images существуют в public/ (если путь локальный). */
export function validateCatalogImagePaths(items: CatalogItem[], publicDir: string): KatalogValidationIssue[] {
  const issues: KatalogValidationIssue[] = [];

  for (const item of items) {
    for (const img of item.images ?? []) {
      if (!img.startsWith('/')) continue;
      const rel = img.replace(/^\//, '').split('?')[0];
      const full = path.join(publicDir, rel);
      if (!fs.existsSync(full)) {
        issues.push({ level: 'warn', slug: item.slug, message: `Файл не найден: ${rel}` });
      }
    }
  }

  return issues;
}

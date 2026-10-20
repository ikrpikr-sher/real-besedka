import { NextRequest, NextResponse } from 'next/server';
import { isAuthed } from '@/lib/adminAuth';
import { isCatalogCategory, type CatalogCategorySlug } from '@/lib/catalogCategories';
import { syncCatalogAfterAdminChange } from '@/lib/catalogAdminSync';
import { readCatalogItems, reorderCatalogItems, writeCatalogItems } from '@/lib/katalogStore';

type ReorderBody = {
  slugs: string[];
  category?: CatalogCategorySlug | 'all';
};

export async function PATCH(req: NextRequest) {
  if (!isAuthed()) return NextResponse.json({ ok: false }, { status: 401 });

  let body: ReorderBody;
  try {
    body = (await req.json()) as ReorderBody;
  } catch {
    return NextResponse.json({ ok: false, error: 'Некорректный JSON' }, { status: 400 });
  }

  if (!Array.isArray(body.slugs) || body.slugs.length === 0) {
    return NextResponse.json({ ok: false, error: 'Укажите slugs' }, { status: 400 });
  }

  const category =
    body.category && body.category !== 'all' && isCatalogCategory(body.category)
      ? body.category
      : undefined;

  if (body.category && body.category !== 'all' && !category) {
    return NextResponse.json({ ok: false, error: 'Неизвестная категория' }, { status: 400 });
  }

  try {
    const items = readCatalogItems();
    const next = reorderCatalogItems(items, body.slugs, category);
    writeCatalogItems(next);
    syncCatalogAfterAdminChange();
    return NextResponse.json({ ok: true, items: next });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Не удалось сохранить порядок';
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { isAuthed } from '@/lib/adminAuth';
import { inferCatalogCategory, isCatalogCategory } from '@/lib/catalogCategories';
import { syncCatalogAfterAdminChange } from '@/lib/catalogAdminSync';
import { readCatalogItems, writeCatalogItems } from '@/lib/katalogStore';
import type { CatalogItem } from '@/lib/content';

export type { CatalogItem };

export async function GET() {
  if (!isAuthed()) return NextResponse.json({ ok: false }, { status: 401 });
  return NextResponse.json({ ok: true, items: readCatalogItems() });
}

export async function POST(req: NextRequest) {
  if (!isAuthed()) return NextResponse.json({ ok: false }, { status: 401 });
  const body = (await req.json()) as CatalogItem;
  if (!body.slug) return NextResponse.json({ ok: false, error: 'Укажите slug' }, { status: 400 });
  if (!isCatalogCategory(body.category)) {
    return NextResponse.json({ ok: false, error: 'Выберите категорию' }, { status: 400 });
  }

  const items = readCatalogItems();
  if (items.some((p) => p.slug === body.slug)) {
    return NextResponse.json({ ok: false, error: 'Такой slug уже есть' }, { status: 409 });
  }

  items.push({
    ...body,
    category: inferCatalogCategory(body),
    priceFrom: Number(body.priceFrom) || 0,
    images: body.images || [],
    model3d: body.model3d?.trim() || undefined,
    seoDescription: body.seoDescription?.trim().slice(0, 250) || undefined,
  });
  writeCatalogItems(items);
  syncCatalogAfterAdminChange({ category: body.category, slug: body.slug });
  return NextResponse.json({ ok: true });
}

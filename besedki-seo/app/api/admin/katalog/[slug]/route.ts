import { NextRequest, NextResponse } from 'next/server';
import { isAuthed } from '@/lib/adminAuth';
import { inferCatalogCategory, isCatalogCategory } from '@/lib/catalogCategories';
import { syncCatalogAfterAdminChange } from '@/lib/catalogAdminSync';
import { readCatalogItems, writeCatalogItems } from '@/lib/katalogStore';
import type { CatalogItem } from '@/lib/content';

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  if (!isAuthed()) return NextResponse.json({ ok: false }, { status: 401 });
  const item = readCatalogItems().find((p) => p.slug === params.slug);
  if (!item) return NextResponse.json({ ok: false, error: 'Не найдено' }, { status: 404 });
  return NextResponse.json({ ok: true, item });
}

export async function PUT(req: NextRequest, { params }: { params: { slug: string } }) {
  if (!isAuthed()) return NextResponse.json({ ok: false }, { status: 401 });
  const body = (await req.json()) as CatalogItem;
  if (!isCatalogCategory(body.category)) {
    return NextResponse.json({ ok: false, error: 'Выберите категорию' }, { status: 400 });
  }

  const items = readCatalogItems();
  const idx = items.findIndex((p) => p.slug === params.slug);
  if (idx === -1) return NextResponse.json({ ok: false, error: 'Не найдено' }, { status: 404 });

  items[idx] = {
    ...body,
    slug: params.slug,
    category: inferCatalogCategory({ ...body, slug: params.slug }),
    priceFrom: Number(body.priceFrom) || 0,
    images: body.images || [],
    model3d: body.model3d?.trim() || undefined,
    seoDescription: body.seoDescription?.trim().slice(0, 250) || undefined,
  };
  writeCatalogItems(items);
  syncCatalogAfterAdminChange({ category: items[idx].category, slug: params.slug });
  return NextResponse.json({ ok: true, item: items[idx] });
}

export async function DELETE(_req: NextRequest, { params }: { params: { slug: string } }) {
  if (!isAuthed()) return NextResponse.json({ ok: false }, { status: 401 });
  const items = readCatalogItems();
  writeCatalogItems(items.filter((p) => p.slug !== params.slug));
  syncCatalogAfterAdminChange();
  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from 'next/server';
import { isAuthed } from '@/lib/adminAuth';
import { syncCatalogAfterAdminChange } from '@/lib/catalogAdminSync';
import { readCatalogItems, writeCatalogItems } from '@/lib/katalogStore';
import { buildProductSeoDescription } from '@/lib/productSeoDescription';

const PILOT_LIMIT = 3;

/** Заполняет seoDescription только у карточек без сниппета. Цену и фото не трогает. Максимум 3 за запрос. */
export async function POST(req: NextRequest) {
  if (!isAuthed()) return NextResponse.json({ ok: false }, { status: 401 });

  let onlyEmpty = true;
  let limit = PILOT_LIMIT;
  try {
    const body = (await req.json()) as { onlyEmpty?: boolean; limit?: number };
    if (body && body.onlyEmpty === false) onlyEmpty = false;
    if (body?.limit != null) {
      const n = Number(body.limit);
      if (Number.isFinite(n)) limit = Math.max(1, Math.min(PILOT_LIMIT, Math.floor(n)));
    }
  } catch {
    onlyEmpty = true;
  }

  const items = readCatalogItems();
  let filled = 0;
  const slugs: string[] = [];

  const next = items.map((item) => {
    if (filled >= limit) return item;
    const hasCustom = Boolean(item.seoDescription?.trim());
    if (hasCustom && onlyEmpty) return item;
    const seoDescription = buildProductSeoDescription(item);
    if (seoDescription === item.seoDescription) return item;
    filled += 1;
    slugs.push(item.slug);
    return { ...item, seoDescription };
  });

  if (filled > 0) {
    writeCatalogItems(next);
    syncCatalogAfterAdminChange();
  }

  return NextResponse.json({
    ok: true,
    filled,
    skipped: items.length - filled,
    slugs,
    onlyEmpty,
    limit,
  });
}

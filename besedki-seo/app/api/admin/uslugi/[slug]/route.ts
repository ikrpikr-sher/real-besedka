import { NextRequest, NextResponse } from 'next/server';
import { readJson, writeJson } from '@/lib/contentStore';
import { isAuthed } from '@/lib/adminAuth';
import type { ServiceItem } from '../route';

const FILE = 'uslugi.json';

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  if (!isAuthed()) return NextResponse.json({ ok: false }, { status: 401 });
  const items = readJson<ServiceItem[]>(FILE);
  const item = items.find((p) => p.slug === params.slug);
  if (!item) return NextResponse.json({ ok: false, error: 'Не найдено' }, { status: 404 });
  return NextResponse.json({ ok: true, item });
}

export async function PUT(req: NextRequest, { params }: { params: { slug: string } }) {
  if (!isAuthed()) return NextResponse.json({ ok: false }, { status: 401 });
  const body = (await req.json()) as ServiceItem;
  const items = readJson<ServiceItem[]>(FILE);
  const idx = items.findIndex((p) => p.slug === params.slug);
  if (idx === -1) return NextResponse.json({ ok: false, error: 'Не найдено' }, { status: 404 });
  items[idx] = { ...body, slug: params.slug };
  writeJson(FILE, items);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: { slug: string } }) {
  if (!isAuthed()) return NextResponse.json({ ok: false }, { status: 401 });
  const items = readJson<ServiceItem[]>(FILE);
  writeJson(FILE, items.filter((p) => p.slug !== params.slug));
  return NextResponse.json({ ok: true });
}

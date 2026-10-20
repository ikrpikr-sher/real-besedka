import { NextRequest, NextResponse } from 'next/server';
import { readJson, writeJson } from '@/lib/contentStore';
import { isAuthed } from '@/lib/adminAuth';

const FILE = 'materialy.json';

export type MaterialItem = {
  slug: string;
  title: string;
  summary: string;
  coverImage?: string;
  pros: string[];
  cons: string[];
};

export async function GET() {
  if (!isAuthed()) return NextResponse.json({ ok: false }, { status: 401 });
  return NextResponse.json({ ok: true, items: readJson<MaterialItem[]>(FILE) });
}

export async function POST(req: NextRequest) {
  if (!isAuthed()) return NextResponse.json({ ok: false }, { status: 401 });
  const body = (await req.json()) as MaterialItem;
  if (!body.slug) return NextResponse.json({ ok: false, error: 'Укажите slug' }, { status: 400 });
  const items = readJson<MaterialItem[]>(FILE);
  if (items.some((p) => p.slug === body.slug)) {
    return NextResponse.json({ ok: false, error: 'Такой slug уже есть' }, { status: 409 });
  }
  items.push(body);
  writeJson(FILE, items);
  return NextResponse.json({ ok: true });
}

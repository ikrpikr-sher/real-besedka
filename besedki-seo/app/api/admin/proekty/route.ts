import { NextRequest, NextResponse } from 'next/server';
import { readJson, writeJson } from '@/lib/contentStore';
import { isAuthed } from '@/lib/adminAuth';

const FILE = 'proekty.json';

export type Project = {
  slug: string;
  title: string;
  material: string;
  size: string;
  roof: string;
  foundation: string;
  priceFrom: number;
  description: string;
  images: string[];
};

export async function GET() {
  if (!isAuthed()) return NextResponse.json({ ok: false }, { status: 401 });
  return NextResponse.json({ ok: true, items: readJson<Project[]>(FILE) });
}

export async function POST(req: NextRequest) {
  if (!isAuthed()) return NextResponse.json({ ok: false }, { status: 401 });
  const body = (await req.json()) as Project;
  if (!body.slug) return NextResponse.json({ ok: false, error: 'Укажите slug' }, { status: 400 });
  const items = readJson<Project[]>(FILE);
  if (items.some((p) => p.slug === body.slug)) {
    return NextResponse.json({ ok: false, error: 'Такой slug уже есть' }, { status: 409 });
  }
  items.push(body);
  writeJson(FILE, items);
  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from 'next/server';
import { isAuthed } from '@/lib/adminAuth';
import { readSeoMap, setSeo } from '@/lib/seo';

export async function GET() {
  if (!isAuthed()) return NextResponse.json({ ok: false }, { status: 401 });
  return NextResponse.json({ ok: true, map: readSeoMap() });
}

export async function PUT(req: NextRequest) {
  if (!isAuthed()) return NextResponse.json({ ok: false }, { status: 401 });
  const body = (await req.json()) as { route?: string; title?: string; description?: string };
  if (!body.route) return NextResponse.json({ ok: false, error: 'Не указан route' }, { status: 400 });
  setSeo(body.route, { title: body.title || '', description: body.description || '' });
  return NextResponse.json({ ok: true });
}

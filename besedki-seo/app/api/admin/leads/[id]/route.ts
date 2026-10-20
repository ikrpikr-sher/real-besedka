import { NextRequest, NextResponse } from 'next/server';
import { readJsonSafe, writeJson } from '@/lib/contentStore';
import { isAuthed } from '@/lib/adminAuth';
import type { Lead } from '@/app/api/leads/route';

const FILE = 'leads.json';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAuthed()) return NextResponse.json({ ok: false }, { status: 401 });
  let body: { status?: Lead['status'] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Некорректный запрос' }, { status: 400 });
  }
  const leads = readJsonSafe<Lead[]>(FILE, []);
  const idx = leads.findIndex((l) => l.id === params.id);
  if (idx === -1) return NextResponse.json({ ok: false, error: 'Не найдено' }, { status: 404 });
  if (body.status) leads[idx].status = body.status;
  writeJson(FILE, leads);
  return NextResponse.json({ ok: true, lead: leads[idx] });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAuthed()) return NextResponse.json({ ok: false }, { status: 401 });
  const leads = readJsonSafe<Lead[]>(FILE, []);
  const next = leads.filter((l) => l.id !== params.id);
  writeJson(FILE, next);
  return NextResponse.json({ ok: true });
}

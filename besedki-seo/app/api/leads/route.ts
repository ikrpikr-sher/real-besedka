import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { readJsonSafe, writeJson } from '@/lib/contentStore';
import { isAuthed } from '@/lib/adminAuth';
import { notifyTelegramLead } from '@/lib/telegramNotify';

export type Lead = {
  id: string;
  name: string;
  phone: string;
  comment?: string;
  context?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  landingPage?: string;
  referrer?: string;
  status: 'new' | 'in_progress' | 'done';
  createdAt: string;
};

function readOptionalString(body: Record<string, unknown>, key: string): string | undefined {
  const value = body[key];
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
}

const FILE = 'leads.json';

// POST — публичный приём заявки с сайта (LeadForm).
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Некорректный запрос' }, { status: 400 });
  }

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
  const comment = typeof body.comment === 'string' ? body.comment.trim() : '';
  const context = typeof body.context === 'string' ? body.context.trim() : '';
  const consent = body.consent === true;

  if (!name || !phone) {
    return NextResponse.json({ ok: false, error: 'Укажите имя и телефон' }, { status: 400 });
  }
  if (!consent) {
    return NextResponse.json({ ok: false, error: 'Нужно согласие на обработку данных' }, { status: 400 });
  }

  const leads = readJsonSafe<Lead[]>(FILE, []);
  const lead: Lead = {
    id: crypto.randomUUID(),
    name,
    phone,
    comment: comment || undefined,
    context: context || undefined,
    utmSource: readOptionalString(body, 'utmSource'),
    utmMedium: readOptionalString(body, 'utmMedium'),
    utmCampaign: readOptionalString(body, 'utmCampaign'),
    utmContent: readOptionalString(body, 'utmContent'),
    utmTerm: readOptionalString(body, 'utmTerm'),
    landingPage: readOptionalString(body, 'landingPage'),
    referrer: readOptionalString(body, 'referrer'),
    status: 'new',
    createdAt: new Date().toISOString(),
  };
  leads.push(lead);
  writeJson(FILE, leads);

  notifyTelegramLead(lead).catch((err) => {
    console.error('[telegram] notify error:', err);
  });

  return NextResponse.json({ ok: true });
}

// GET — только для админки: список всех заявок.
export async function GET() {
  if (!isAuthed()) {
    return NextResponse.json({ ok: false, error: 'Не авторизовано' }, { status: 401 });
  }
  const leads = readJsonSafe<Lead[]>(FILE, []);
  leads.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return NextResponse.json({ ok: true, leads });
}

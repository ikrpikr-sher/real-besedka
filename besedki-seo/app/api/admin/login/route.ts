import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE_NAME, checkPassword, createSessionToken } from '@/lib/adminAuth';

export async function POST(req: NextRequest) {
  let body: { password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Некорректный запрос' }, { status: 400 });
  }

  if (!process.env.ADMIN_PASSWORD) {
    return NextResponse.json(
      { ok: false, error: 'ADMIN_PASSWORD не задан на сервере — см. CLAUDE.md' },
      { status: 500 },
    );
  }

  if (!body.password || !checkPassword(body.password)) {
    return NextResponse.json({ ok: false, error: 'Неверный пароль' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE_NAME, createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}

import type { Metadata } from 'next';

// Общий layout для всего /admin/*, включая /admin/login — здесь только
// noindex, БЕЗ проверки авторизации (иначе страница логина сама себя
// редиректила бы на логин). Проверка авторизации и меню — в
// app/admin/(protected)/layout.tsx, который оборачивает всё, кроме /admin/login.
export const metadata: Metadata = {
  title: { default: 'Админка', template: '%s — Админка' },
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}

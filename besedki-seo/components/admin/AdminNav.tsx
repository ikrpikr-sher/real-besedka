'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const links = [
  { href: '/admin', label: 'Обзор' },
  { href: '/admin/leads', label: 'Заявки' },
  { href: '/admin/catalog/katalog', label: 'Каталог' },
  { href: '/admin/catalog/uslugi', label: 'Услуги' },
  { href: '/admin/catalog/materialy', label: 'Материалы' },
  { href: '/admin/blog', label: 'Блог' },
  { href: '/admin/seo', label: 'SEO' },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <nav className="flex w-full shrink-0 flex-col border-b border-border bg-bg md:w-56 md:border-b-0 md:border-r">
      <div className="flex items-center justify-between gap-2 px-4 py-3 md:block md:p-4">
        <p className="font-heading text-lg">Админка</p>
        <div className="flex items-center gap-2 md:mt-4 md:block">
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-DEFAULT px-3 py-2 text-sm text-text-muted hover:bg-border/50 md:mt-4 md:w-full md:text-left"
          >
            Выйти
          </button>
          <Link href="/" className="rounded-DEFAULT px-3 py-2 text-xs text-text-muted hover:underline md:mt-2 md:block md:px-3">
            ← На сайт
          </Link>
        </div>
      </div>
      <div className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:overflow-visible md:px-4 md:pb-4">
        {links.map((link) => {
          const active = pathname === link.href || (link.href !== '/admin' && pathname?.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`shrink-0 rounded-DEFAULT px-3 py-2 text-sm whitespace-nowrap ${
                active ? 'bg-accent text-bg' : 'text-text hover:bg-border/50'
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

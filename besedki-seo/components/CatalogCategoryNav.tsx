'use client';

import NavLink from '@/components/NavLink';
import { usePathname } from 'next/navigation';
import { CATALOG_CATEGORIES } from '@/lib/catalogCategories';

export default function CatalogCategoryNav() {
  const pathname = usePathname() || '';

  if (!pathname.startsWith('/katalog')) return null;

  const activeSlug = pathname.startsWith('/katalog/')
    ? pathname.split('/')[2] || null
    : pathname === '/katalog'
      ? null
      : null;

  return (
    <nav
      aria-label="Разделы каталога"
      className="sticky top-14 z-30 border-b border-border bg-bg/95 backdrop-blur supports-[backdrop-filter]:bg-bg/90 lg:top-16"
    >
      <div className="mx-auto max-w-container px-4 py-2 sm:px-6">
        <div className="-mx-1 flex gap-2 overflow-x-auto overscroll-x-contain px-1 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <NavLink
            href="/katalog"
            className={`shrink-0 rounded-full px-3 py-2 text-sm font-medium transition-colors ${
              pathname === '/katalog'
                ? 'bg-accent text-white'
                : 'border border-border bg-surface text-text hover:border-accent/40'
            }`}
          >
            Все
          </NavLink>
          {CATALOG_CATEGORIES.map((cat) => {
            const href = `/katalog/${cat.slug}`;
            const active = activeSlug === cat.slug;
            return (
              <NavLink
                key={cat.slug}
                href={href}
                className={`shrink-0 rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-accent text-white'
                    : 'border border-border bg-surface text-text hover:border-accent/40'
                }`}
              >
                {cat.shortTitle}
              </NavLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

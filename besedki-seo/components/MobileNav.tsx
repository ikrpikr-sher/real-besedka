'use client';

import { useEffect, useState } from 'react';
import TelegramLink from './TelegramLink';
import { CATALOG_CATEGORIES } from '@/lib/catalogCategories';
import type { SiteConfig } from '@/lib/content';

type Props = {
  nav: SiteConfig['nav'];
  phone: string;
  telegramHref: string;
};

export default function MobileNav({ nav, phone, telegramHref }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    document.body.classList.toggle('mobile-nav-open', open);
    return () => {
      document.body.style.overflow = '';
      document.body.classList.remove('mobile-nav-open');
    };
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-11 w-11 items-center justify-center rounded-DEFAULT border border-border bg-surface text-text"
      >
        {open ? (
          <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
            <path
              fill="currentColor"
              d="M18.3 5.71a1 1 0 0 0-1.41 0L12 10.59 7.11 5.7A1 1 0 1 0 5.7 7.11L10.59 12 5.7 16.89a1 1 0 1 0 1.41 1.41L12 13.41l4.89 4.89a1 1 0 0 0 1.41-1.41L13.41 12l4.89-4.89a1 1 0 0 0 0-1.4z"
            />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
            <path fill="currentColor" d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z" />
          </svg>
        )}
      </button>

      {open ? (
        <div className="fixed inset-0 z-[100]">
          <button
            type="button"
            aria-label="Закрыть меню"
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <nav
            id="mobile-nav-panel"
            className="absolute right-0 top-0 flex h-full w-[min(100%,22rem)] flex-col border-l border-border bg-bg pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)] shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <span className="font-heading text-base font-semibold">Меню</span>
              <button
                type="button"
                aria-label="Закрыть меню"
                onClick={() => setOpen(false)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-DEFAULT border border-border"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M18.3 5.71a1 1 0 0 0-1.41 0L12 10.59 7.11 5.7A1 1 0 1 0 5.7 7.11L10.59 12 5.7 16.89a1 1 0 1 0 1.41 1.41L12 13.41l4.89 4.89a1 1 0 0 0 1.41-1.41L13.41 12l4.89-4.89a1 1 0 0 0 0-1.4z"
                  />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4">
              <div className="mb-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">Каталог</p>
                <div className="flex flex-wrap gap-2">
                  <a
                    href="/katalog"
                    onClick={() => setOpen(false)}
                    className="rounded-full border border-border bg-surface px-3 py-2 text-sm font-medium text-text hover:border-accent/40"
                  >
                    Все модели
                  </a>
                  {CATALOG_CATEGORIES.map((cat) => (
                    <a
                      key={cat.slug}
                      href={`/katalog/${cat.slug}`}
                      onClick={() => setOpen(false)}
                      className="rounded-full border border-border bg-surface px-3 py-2 text-sm text-text hover:border-accent/40"
                    >
                      {cat.shortTitle}
                    </a>
                  ))}
                </div>
              </div>

              <ul className="space-y-1 border-t border-border pt-4">
                {nav.map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="block rounded-DEFAULT px-3 py-3 text-base text-text hover:bg-surface"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>

              <div className="mt-6 space-y-3 border-t border-border pt-4">
                <a
                  href={`tel:${phone.replace(/[^\d+]/g, '')}`}
                  className="block text-base font-medium text-text hover:text-accent"
                >
                  {phone}
                </a>
                <TelegramLink href={telegramHref} showLabel label="Написать в Telegram" />
              </div>
            </div>

            <div className="border-t border-border p-4">
              <a href="/kontakty" onClick={() => setOpen(false)} className="btn-primary w-full text-center">
                Оставить заявку
              </a>
            </div>
          </nav>
        </div>
      ) : null}
    </div>
  );
}

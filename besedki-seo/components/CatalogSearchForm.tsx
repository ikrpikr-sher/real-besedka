'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

type Props = {
  className?: string;
  defaultQuery?: string;
  placeholder?: string;
  autoFocus?: boolean;
  compact?: boolean;
  onNavigate?: () => void;
};

export default function CatalogSearchForm({
  className = '',
  defaultQuery = '',
  placeholder = 'Поиск: модель, размер, B-53…',
  autoFocus = false,
  compact = false,
  onNavigate,
}: Props) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultQuery);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    const href = trimmed
      ? `/katalog/poisk?q=${encodeURIComponent(trimmed)}`
      : '/katalog/poisk';
    router.push(href);
    onNavigate?.();
  }

  return (
    <form onSubmit={submit} className={className} role="search">
      <label htmlFor="catalog-search" className="sr-only">
        Поиск по каталогу
      </label>
      <div className="flex items-center gap-2">
        <input
          id="catalog-search"
          type="search"
          name="q"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          enterKeyHint="search"
          autoComplete="off"
          className={
            compact
              ? 'min-w-0 flex-1 rounded-DEFAULT border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent'
              : 'min-w-0 flex-1 rounded-DEFAULT border border-border bg-surface px-4 py-2.5 text-sm text-text placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent sm:text-base'
          }
        />
        <button
          type="submit"
          aria-label="Найти в каталоге"
          className={
            compact
              ? 'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-DEFAULT border border-border bg-surface text-text hover:border-accent/40 hover:text-accent'
              : 'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-DEFAULT border border-border bg-surface text-text hover:border-accent/40 hover:text-accent'
          }
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
            <path
              fill="currentColor"
              d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
            />
          </svg>
        </button>
      </div>
    </form>
  );
}

'use client';

import { usePathname } from 'next/navigation';

type Props = {
  phone: string;
};

export default function MobileStickyCta({ phone }: Props) {
  const pathname = usePathname();

  if (pathname?.startsWith('/admin')) return null;

  const tel = phone.replace(/[^\d+]/g, '');

  function scrollToForm() {
    const el = document.getElementById('site-lead-form');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    window.location.href = '/kontakty#site-lead-form';
  }

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-bg/95 backdrop-blur lg:hidden hide-when-nav-open"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="mx-auto flex max-w-container gap-2 px-4 py-2">
        <a href={`tel:${tel}`} className="btn-secondary min-h-11 flex-1 justify-center text-sm">
          Позвонить
        </a>
        <button type="button" onClick={scrollToForm} className="btn-primary min-h-11 flex-1 text-sm">
          Заявка
        </button>
      </div>
    </div>
  );
}

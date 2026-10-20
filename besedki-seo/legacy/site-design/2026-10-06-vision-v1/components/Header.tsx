import NavLink from './NavLink';
import Container from './Container';
import TelegramLink from './TelegramLink';
import MobileNav from './MobileNav';
import { getSite } from '@/lib/content';

export default function Header() {
  const site = getSite();
  const telegramHref = site.telegram || site.social?.telegram || '';

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-bg/85 pt-[env(safe-area-inset-top)] backdrop-blur-md supports-[backdrop-filter]:bg-bg/80">
      <Container className="flex h-14 items-center gap-2 sm:h-[4.25rem] sm:gap-3">
        <NavLink
          href="/"
          className="min-w-0 shrink font-heading text-sm font-semibold tracking-tight text-text whitespace-nowrap sm:text-lg"
        >
          {site.siteName}
        </NavLink>

        <div className="ml-auto flex min-w-0 items-center gap-2 lg:gap-3">
          <nav className="hidden items-center gap-3 lg:flex xl:gap-5" aria-label="Основная навигация">
            {site.nav.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                className="whitespace-nowrap text-sm text-text hover:text-accent"
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <div className="hidden items-center gap-2 lg:flex">
              <a href={`tel:${site.phone.replace(/[^\d+]/g, '')}`} className="text-sm text-text hover:text-accent">
                {site.phone}
              </a>
              <TelegramLink href={telegramHref} />
            </div>
            <div className="hidden sm:flex lg:hidden">
              <TelegramLink
                href={telegramHref}
                className="inline-flex h-11 w-11 items-center justify-center rounded-DEFAULT border border-border"
              />
            </div>
            <NavLink
              href="/kontakty"
              className="btn-primary hidden px-3 py-2 text-xs md:inline-flex md:px-5 md:py-3 md:text-sm lg:inline-flex"
            >
              Заявка
            </NavLink>
            <NavLink
              href="/katalog"
              className="btn-secondary shrink-0 px-3 py-2 text-xs sm:text-sm lg:hidden"
            >
              Каталог
            </NavLink>
            <NavLink
              href="/katalog/poisk"
              aria-label="Поиск по каталогу"
              className="inline-flex h-11 w-11 items-center justify-center rounded-DEFAULT border border-border bg-surface text-text hover:border-accent/40 hover:text-accent"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
                />
              </svg>
            </NavLink>
            <MobileNav nav={site.nav} phone={site.phone} telegramHref={telegramHref} />
          </div>
        </div>
      </Container>
    </header>
  );
}

import NavLink from './NavLink';
import Container from './Container';
import { getSite, TWOGIS_FIRM_URL } from '@/lib/content';

export default function Footer() {
  const site = getSite();

  return (
    <footer className="mt-12 border-t border-border bg-text text-bg sm:mt-16">
      <Container className="grid gap-8 py-8 sm:py-10 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-heading text-lg">{site.siteName}</p>
          <p className="mt-2 text-sm text-bg/70">{site.description}</p>
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-bg/60">Разделы</p>
          <ul className="space-y-1 text-sm">
            {site.nav.map((item) => (
              <li key={item.href}>
                <NavLink href={item.href} className="hover:underline">
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-bg/60">Для поиска</p>
          <ul className="space-y-1 text-sm">
            <li>
              <NavLink href="/besedka-iz-metalla" className="hover:underline">
                Беседка из металла
              </NavLink>
            </li>
            <li>
              <NavLink href="/metallicheskie-besedki" className="hover:underline">
                Металлические беседки
              </NavLink>
            </li>
            <li>
              <NavLink href="/kupit-besedku" className="hover:underline">
                Купить беседку
              </NavLink>
            </li>
            <li>
              <NavLink href="/besedka-3x3" className="hover:underline">
                Беседка 3×3
              </NavLink>
            </li>
            <li>
              <NavLink href="/besedka-4x4" className="hover:underline">
                Беседка 4×4
              </NavLink>
            </li>
            <li>
              <NavLink href="/besedka-s-mangalom-pod-klyuch" className="hover:underline">
                С мангалом
              </NavLink>
            </li>
            <li>
              <NavLink href="/besedka-pod-klyuch" className="hover:underline">
                Под ключ
              </NavLink>
            </li>
            <li>
              <NavLink href="/besedka-loft" className="hover:underline">
                Лофт
              </NavLink>
            </li>
            <li>
              <NavLink href="/zakrytaya-besedka" className="hover:underline">
                Закрытая
              </NavLink>
            </li>
            <li>
              <NavLink href="/besedka-metall-ili-derevo" className="hover:underline">
                Металл или дерево
              </NavLink>
            </li>
            <li>
              <NavLink href="/tseny-na-besedki" className="hover:underline">
                Цены
              </NavLink>
            </li>
          </ul>
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-bg/60">Контакты</p>
          <p className="text-sm">
            <a href={`tel:${site.phone.replace(/[^\d+]/g, '')}`} className="hover:underline">
              {site.phone}
            </a>
          </p>
          <p className="text-sm">
            <a href={`mailto:${site.email}`} className="hover:underline">
              {site.email}
            </a>
          </p>
          <p className="mt-2 text-sm">
            <NavLink href="/kontakty#sposoby-oplaty" className="hover:underline">
              Способы оплаты
            </NavLink>
          </p>
          <p className="mt-3 text-sm">
            <a href="https://dzen.ru/realbesedki" className="hover:underline" rel="noopener noreferrer">
              Дзен — Real Besedki
            </a>
          </p>
          <p className="text-sm">
            <a
              href={TWOGIS_FIRM_URL}
              className="hover:underline"
              rel="noopener noreferrer"
            >
              2ГИС — Складочная, 3с3
            </a>
          </p>
          {site.telegram ? (
            <p className="text-sm">
              <a href={site.telegram} className="hover:underline" rel="noopener noreferrer">
                Telegram
              </a>
            </p>
          ) : null}
        </div>
      </Container>
      <div className="border-t border-bg/10 px-4 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] text-center text-xs text-bg/50">
        <p className="break-words">
          © {new Date().getFullYear()} {site.legalName}, ИНН {site.inn}, КПП {site.kpp}. Все права защищены.
        </p>
        <p className="mt-1">
          <NavLink href="/politika-konfidencialnosti" className="hover:underline">
            Политика конфиденциальности
          </NavLink>
        </p>
      </div>
    </footer>
  );
}

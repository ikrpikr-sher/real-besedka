export type NavItem = { label: string; href: string };

/** Ссылки, которые должны быть в меню даже если server site.json старый (rsync exclude). */
export const REQUIRED_NAV: NavItem[] = [
  { label: 'Каталог', href: '/katalog' },
  { label: 'Конфигуратор', href: '/konfigurator' },
  { label: 'Москва и МО', href: '/regiony' },
  { label: 'Портфолио', href: '/proekty' },
  { label: 'Блог', href: '/blog' },
  { label: 'Отзывы', href: '/otzyvy' },
  { label: 'Контакты', href: '/kontakty' },
];

/** Desktop: короткий ряд — иначе 11 пунктов + телефон ломают шапку. */
export const DESKTOP_NAV_HREFS = new Set([
  '/katalog',
  '/konfigurator',
  '/proekty',
  '/blog',
  '/kontakty',
]);

export function mergeSiteNav(nav: NavItem[] | undefined): NavItem[] {
  const fromFile = Array.isArray(nav) ? nav : [];
  const byHref = new Map<string, NavItem>();
  for (const item of REQUIRED_NAV) byHref.set(item.href, item);
  for (const item of fromFile) {
    if (!item?.href) continue;
    // не затираем required labels, но добавляем уникальные из файла (услуги и т.п.)
    if (!byHref.has(item.href)) byHref.set(item.href, item);
  }
  // порядок: required first, then extras from file
  const ordered: NavItem[] = [];
  const seen = new Set<string>();
  for (const item of REQUIRED_NAV) {
    ordered.push(byHref.get(item.href) || item);
    seen.add(item.href);
  }
  for (const item of fromFile) {
    if (!item?.href || seen.has(item.href)) continue;
    ordered.push(item);
    seen.add(item.href);
  }
  return ordered;
}

export function desktopNav(nav: NavItem[]): NavItem[] {
  return nav.filter((item) => DESKTOP_NAV_HREFS.has(item.href));
}

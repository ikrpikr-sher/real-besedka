import { CATALOG_CATEGORIES } from './catalogCategories';

/** Список публичных страниц со статическим title/description, редактируемых через /admin/seo. */
export const SEO_ROUTES: { route: string; label: string }[] = [
  { route: '/', label: 'Главная' },
  { route: '/katalog', label: 'Каталог — общий' },
  ...CATALOG_CATEGORIES.map((c) => ({ route: `/katalog/${c.slug}`, label: `Каталог — ${c.title}` })),
  { route: '/uslugi', label: 'Услуги — каталог' },
  { route: '/materialy', label: 'Материалы — каталог' },
  { route: '/blog', label: 'Блог — лента' },
  { route: '/o-kompanii', label: 'О компании' },
  { route: '/kontakty', label: 'Контакты' },
  { route: '/podbor-besedki', label: 'Квиз «Подбор беседки»' },
  { route: '/konfigurator', label: 'Конфигуратор беседки' },
  { route: '/politika-konfidencialnosti', label: 'Политика конфиденциальности' },
];

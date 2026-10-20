export const CATALOG_CATEGORIES = [
  {
    slug: 'otkrytye-besedki',
    title: 'Беседки открытые',
    shortTitle: 'Открытые',
    description:
      'Дизайнерские открытые беседки из металла: каркас 80×80 на болтах, металлочерепица, пол фанера в базе (ДПК — опция), панели из стали 3 мм с ЧПУ. Модели B-10…B-16 и серия с панелями 2 м B-41…B-50. Производство и монтаж в Москве и МО.',
    emptyText: 'Модели скоро появятся в каталоге.',
  },
  {
    slug: 'besedki-s-ostekleniem',
    title: 'Беседки с остеклением',
    shortTitle: 'С остеклением',
    description:
      'Металлические беседки с раздвижным остеклением — круглогодичный отдых. Каркас 80×80, пол фанера в базе (ДПК — опция). Серия «Панорама» B-21…B-30 и «Панорама» с лазерными панелями B-31…B-40. Производство и монтаж в Москве и МО.',
    emptyText: 'Модели скоро появятся в каталоге.',
  },
  {
    slug: 'besedki-osteklennye-loft',
    title: 'Беседки остеклённые лофт',
    shortTitle: 'Остекл. лофт',
    description:
      'Остеклённые беседки в стиле лофт: каркас 80×80, раздвижное остекление, профнастил С8 и WPC. Серия C8 — компактные модели для участка. Производство и монтаж в Москве и МО.',
    emptyText: 'Модели скоро появятся в каталоге.',
  },
  {
    slug: 'besedki-s-mangalom',
    title: 'Беседки с мангалом',
    shortTitle: 'С мангалом',
    description:
      'Беседки серии «Огонь»: лазерные панели, пол ДПК, встроенный мангал с дымоходом. 10 моделей от 3×2 до 6×5 м, от 420 000 ₽.',
    emptyText: 'Каталог беседок с мангалом наполняется — скоро здесь появятся модели и цены.',
  },
  {
    slug: 'navesy',
    title: 'Навесы',
    shortTitle: 'Навесы',
    description:
      'Металлические навесы для автомобилей, террас и зон отдыха. Собственное производство, порошковая краска, монтаж под ключ в Москве и МО.',
    emptyText: 'Каталог навесов наполняется — скоро здесь появятся модели и цены.',
  },
  {
    slug: 'mangaly',
    title: 'Мангалы и мангальные зоны',
    shortTitle: 'Мангалы',
    description:
      'Отдельные мангалы, чаши и барбекю — или мангальная зона под навесом серии «Огонь». Сталь 3–6 мм, порошок RAL 7016, Москва и МО.',
    emptyText: 'Модели скоро появятся в каталоге.',
  },
  {
    slug: 'kacheli',
    title: 'Качели',
    shortTitle: 'Качели',
    description:
      'Садовые качели из металла: серия «Графит» K-01…K-24 (каркас 80×80, 12 лазерных узоров) и отдельные модели на каркасе 70×70 — Lyon, Malmo, решётка, поликарбонат.',
    emptyText: 'Каталог качелей наполняется — скоро здесь появятся модели и цены.',
  },
  {
    slug: 'pavilony',
    title: 'Павильоны',
    shortTitle: 'Павильоны',
    description:
      'Металлические павильоны для участка, мероприятий и коммерческих объектов. Проектирование и производство на собственном заводе.',
    emptyText: 'Каталог павильонов наполняется — скоро здесь появятся модели и цены.',
  },
] as const;

export type CatalogCategorySlug = (typeof CATALOG_CATEGORIES)[number]['slug'];

/** Черновики в katalog.json: не витрина, пока нет фото и офера. Не смешивать с беседками. */
export const UNPUBLISHED_CATALOG_CATEGORIES = [
  'pergoly',
  'hozbloki',
  'drovniki',
  'bytovki',
  'mebel',
  'ochagi',
] as const;

export function isUnpublishedCatalogCategory(slug: string): boolean {
  return (UNPUBLISHED_CATALOG_CATEGORIES as readonly string[]).includes(slug);
}

export function isCatalogCategory(slug: string): slug is CatalogCategorySlug {
  return CATALOG_CATEGORIES.some((c) => c.slug === slug);
}

export function getCatalogCategory(slug: string) {
  return CATALOG_CATEGORIES.find((c) => c.slug === slug);
}

export function catalogCategoryPath(slug: CatalogCategorySlug): string {
  return `/katalog/${slug}`;
}

export function catalogItemPath(category: CatalogCategorySlug, itemSlug: string): string {
  return `/katalog/${category}/${itemSlug}`;
}

export function inferCatalogCategory(item: { slug: string; title: string; category?: string }): CatalogCategorySlug {
  if (item.category === 'zakrytye-besedki') return 'besedki-s-ostekleniem';
  if (item.category && isUnpublishedCatalogCategory(item.category)) {
    return item.category as CatalogCategorySlug;
  }
  if (item.category && isCatalogCategory(item.category)) return item.category;
  if (item.slug === 'b-53' || item.slug === 'b-54') return 'besedki-osteklennye-loft';
  if (
    /закрыт|остеклен/i.test(item.title) ||
    /^b-2/.test(item.slug) ||
    /^b-3/.test(item.slug) ||
    item.slug === 'b-40'
  ) {
    return 'besedki-s-ostekleniem';
  }
  if (/^bm-/.test(item.slug)) return 'besedki-s-mangalom';
  if (/^m-/.test(item.slug) || /мангал|барбекю|костров/i.test(item.title)) return 'mangaly';
  if (/^b-/.test(item.slug)) return 'otkrytye-besedki';
  if (/^n-|^nav/.test(item.slug)) return 'navesy';
  if (/^k-|^kach/.test(item.slug)) return 'kacheli';
  if (/^p-|^pav/.test(item.slug)) return 'pavilony';
  return 'otkrytye-besedki';
}

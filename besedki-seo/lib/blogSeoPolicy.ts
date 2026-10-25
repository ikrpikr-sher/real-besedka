/**
 * Политика индексации блога: режем geo-doorways вне рынка Москва+МО.
 * Серии: fundament-svai-*, zakaz-dostavka-*, krovlya-ostekleni-*.
 * Шаблоны title+MDX с двумя H1 чинятся отдельно (stripLeadingMarkdownH1).
 */

/** Города/районы, где реально ставим / возим в рынке (хвост slug после префикса). */
export const BLOG_GEO_INDEX_ALLOWLIST = new Set([
  'moskva',
  'moscow',
  'balashiha',
  'himki',
  'khimki',
  'odincovo',
  'krasnogorsk',
  'mytishchi',
  'podolsk',
  'istra',
  'korolev',
  'lyubertsy',
  'lyubercy',
  'dolgoprudny',
  'domodedovo',
  'elektrostal',
  'zhukovsky',
  'ramenskoe',
  'sergiev-posad',
  'chekhov',
  'dmitrov',
  'egorievsk',
  'zvenigorod',
  'reutov',
  'vidnoe',
  'lobnya',
  'pushkino',
  'schelkovo',
  'shchelkovo',
  'shchyolkovo',
  'noginsk',
  'klin',
  'solnechnogorsk',
  'naro-fominsk',
  'mozhaysk',
  'volokolamsk',
  'kolomna',
  'voskresensk',
  'stupino',
  'serpuhov',
  'troitsk',
  'orekhovo-zuevo',
  'pavlovsky-posad',
  'fryazino',
  'ivanteevka',
  'kotelniki',
  'lytkarino',
  'bronitsy',
  'shatura',
  'zaraysk',
  'pushchino',
  'krasnoznamensk',
  'dzerzhinsky',
]);

/** Массовые geo-серии: вне allowlist → noindex (не раздуваем эталоном). */
const DOORWAY_PREFIXES = [
  'fundament-svai-',
  'zakaz-dostavka-',
  'krovlya-ostekleni-',
] as const;

export function blogCityFromDoorwaySlug(slug: string): string | null {
  for (const prefix of DOORWAY_PREFIXES) {
    if (slug.startsWith(prefix)) return slug.slice(prefix.length);
  }
  return null;
}

export function isBlogDoorwaySlug(slug: string): boolean {
  return blogCityFromDoorwaySlug(slug) !== null;
}

/** true → robots noindex,follow; не в sitemap / листинг блога. */
export function shouldNoindexBlogPost(slug: string, tags: string[] = []): boolean {
  const city = blogCityFromDoorwaySlug(slug);
  if (city) {
    if (!BLOG_GEO_INDEX_ALLOWLIST.has(city)) return true;
  }
  // Явные теги дальних городов без allowlist
  const farTags = tags.map((t) => t.toLowerCase());
  const farHit = farTags.find(
    (t) =>
      !BLOG_GEO_INDEX_ALLOWLIST.has(t) &&
      [
        'eysk',
        'kaliningrad',
        'sochi',
        'krasnodar',
        'novosibirsk',
        'ekaterinburg',
        'vladivostok',
        'yakutsk',
        'magadan',
        'chita',
        'abakan',
        'alushta',
        'anapa',
        'yalta',
        'bratsk',
      ].includes(t),
  );
  if (farHit && city === null && slug.includes(farHit)) return true;
  return false;
}

export function blogThinContentHubLinks() {
  return [
    { href: '/fundament-pod-besedku', label: 'Фундамент под беседку' },
    { href: '/besedka-na-svayah', label: 'Беседка на сваях' },
    { href: '/regiony', label: 'Монтаж в Москве и МО' },
    { href: '/katalog', label: 'Каталог беседок' },
    { href: '/blog/vintovye-svai-pod-besedku', label: 'Винтовые сваи в МО' },
    { href: '/blog/fundament-dlya-besedki-kakoy-vybrat', label: 'Какой фундамент выбрать' },
    { href: '/blog/kak-vybrat-besedku-dlya-dachi', label: 'Как выбрать беседку для дачи' },
  ] as const;
}

/** Убрать ведущий markdown/HTML H1 из тела статьи (шаблон уже рисует title как H1). */
export function stripLeadingMarkdownH1(content: string): string {
  let out = content.replace(/^\uFEFF/, '');
  // Optional blank lines, then # Title or <h1>...</h1>
  out = out.replace(/^(?:\s*\n)*\s*#\s+[^\n]+\n+/, '');
  out = out.replace(/^(?:\s*\n)*\s*<h1\b[^>]*>[\s\S]*?<\/h1>\s*/i, '');
  return out;
}

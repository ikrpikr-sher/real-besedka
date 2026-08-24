# On-page — хаб / категория / инфо-страница

## Главная `/`

Title и description — из `besedki-seo/data/seo.json` (ключ `/`), не из дефолта layout.

H1 — коммерческий запрос, не только бренд.

## Каталог `/katalog` и `/katalog/{category}`

Title/description — из `data/seo.json` по path.

H1 = человекочитаемое название категории.

JSON-LD: `CollectionPage` + при этапе 2 — `BreadcrumbList`.

## Блог `/blog/category/{slug}` и `/blog/tag/{slug}`

**Проблема сейчас:** H1 «Категория: montazh-i-uhod», description дублирует главную.

**Нужно:**
- Title: `{Название категории} — блог Real Besedki`
- Description: уникальный, 140–160 символов, про тему категории
- H1: `{Название категории}` без slug

## Услуги / материалы / контакты

Title/description — `seo.json` или `generateMetadata` с уникальным текстом.

`/kontakty` — этап 2: `ContactPage` schema, NAP совпадает с `data/site.json`.

## Статья `/blog/{slug}`

Title/description из frontmatter MDX.

JSON-LD: `BlogPosting` + `FAQPage` (если есть FAQ) + `BreadcrumbList`.

Проверить внутренние ссылки: не `/proekty`, а `/katalog/...`.

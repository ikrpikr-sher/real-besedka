# Лог SEO-изменений

Каждая правка на этапе 2 — одна строка. Без «да» пользователя — не писать в лог как «сделано».

| Дата | Объект (URL / файл) | Было | Стало | Причина | Ожидаемый эффект |
|------|---------------------|------|-------|---------|------------------|
| 2026-08-25 | `sources/local.py` | fallback на create-next-app | `site_code_missing`, без скана стартера | ложные critical weekday | честный аудит прода |
| 2026-08-25 | `sources/catalog.py` | пустой каталог без json | 129 URL из sitemap | без `besedki-seo/` не проверялись карточки | 10/10 hero/GLB |
| 2026-08-25 | `site_health/viewport.py` | P1 «нет mobile-nav» | CTA «Каталог» `lg:hidden` = ок | ложный P1 | не блокировать SEO |
| 2026-08-25 | `site_health/runner.py` | CF без прокси = P0 / emergency | P1 owner_action, если origin 200 + форма/tel | ложная авария блокировала SEO | weekday идёт дальше |
| 2026-08-25 | `site_health/onpage.py` | health не видел OG/ContactPage/H1 блога | живой HTML прода в P1/P2 | журнал врал без `besedki-seo/` | честный backlog |
| 2026-10-28 | `/katalog/poisk` | в sitemap, без noindex | `robots: noindex,follow` + нет в sitemap | индексация пустого поиска | поиск не в выдаче |
| 2026-10-28 | leftover-рубрики блога | 200 + H1 `materialy` / `ukhod` / … | 301 → `/blog` | сироты со slug в сниппете | не индексировать пустые рубрики |
| 2026-10-28 | `/katalog/besedki-s-mangalom` | ItemList 20, сетка только BM | ItemList все SKU + секция остальных | хаб не отдавал вес b-76… | внутренние ссылки = карта |
| 2026-10-28 | `deploy/nginx-real-besedki.ru.conf` | в git без location карточки | снимок живого nginx + leftover 301 | не потерять `og:type=product` | безопасный эталон |

**Файл для агента:** дополнять `real-besedki-seo-agent/logs/YYYY-MM-DD_changes.md` после каждого деплоя с SEO-правками.

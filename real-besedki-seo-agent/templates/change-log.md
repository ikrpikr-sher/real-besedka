# Лог SEO-изменений

Каждая правка на этапе 2 — одна строка. Без «да» пользователя — не писать в лог как «сделано».

| Дата | Объект (URL / файл) | Было | Стало | Причина | Ожидаемый эффект |
|------|---------------------|------|-------|---------|------------------|
| 2026-08-25 | `sources/local.py` | fallback на create-next-app | `site_code_missing`, без скана стартера | ложные critical weekday | честный аудит прода |
| 2026-08-25 | `sources/catalog.py` | пустой каталог без json | 129 URL из sitemap | без `besedki-seo/` не проверялись карточки | 10/10 hero/GLB |
| 2026-08-25 | `site_health/viewport.py` | P1 «нет mobile-nav» | CTA «Каталог» `lg:hidden` = ок | ложный P1 | не блокировать SEO |
| 2026-08-25 | `site_health/runner.py` | CF без прокси = P0 / emergency | P1 owner_action, если origin 200 + форма/tel | ложная авария блокировала SEO | weekday идёт дальше |
| 2026-08-25 | `site_health/onpage.py` | health не видел OG/ContactPage/H1 блога | живой HTML прода в P1/P2 | журнал врал без `besedki-seo/` | честный backlog |
| 2026-10-20 | `/katalog/besedki-s-ostekleniem/b-51`, `/katalog/besedki-s-mangalom/b-51`, `/katalog/loft` | 404 | 308 на живые URL | старые коммерческие адреса | вес и клики на карточку, а не в 404 |
| 2026-10-20 | `components/CatalogCard.tsx` | сборка падала: нет prop `priority` | optional `priority`, pin watchdog обновлён | иначе деплой редиректов не собирался | хаб каталога снова билдится |
| 2026-10-20 | seoDescription b-57, b-59, b-58 | пусто | сниппет с фанерой и каркасом 80×80, meta 160 | пилот 3 карточки, цены с сервера | уникальный сниппет открытых беседок |

**Файл для агента:** дополнять `real-besedki-seo-agent/logs/YYYY-MM-DD_changes.md` после каждого деплоя с SEO-правками.

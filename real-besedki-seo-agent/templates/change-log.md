# Лог SEO-изменений

Каждая правка на этапе 2 — одна строка. Без «да» пользователя — не писать в лог как «сделано».

| Дата | Объект (URL / файл) | Было | Стало | Причина | Ожидаемый эффект |
|------|---------------------|------|-------|---------|------------------|
| 2026-08-25 | `sources/local.py` | fallback на create-next-app | `site_code_missing`, без скана стартера | ложные critical weekday | честный аудит прода |
| 2026-08-25 | `sources/catalog.py` | пустой каталог без json | 129 URL из sitemap | без `besedki-seo/` не проверялись карточки | 10/10 hero/GLB |
| 2026-08-25 | `site_health/viewport.py` | P1 «нет mobile-nav» | CTA «Каталог» `lg:hidden` = ок | ложный P1 | не блокировать SEO |
| 2026-08-25 | `site_health/runner.py` | CF без прокси = P0 / emergency | P1 owner_action, если origin 200 + форма/tel | ложная авария блокировала SEO | weekday идёт дальше |
| 2026-08-25 | `site_health/onpage.py` | health не видел OG/ContactPage/H1 блога | живой HTML прода в P1/P2 | журнал врал без `besedki-seo/` | честный backlog |
| 2026-09-02 | `site_health/onpage.py` | type=website + фото = P1 «нет OG» | нет image = P1; type/hero = P2 | ложный P1 блокировал очередь | health = факты прода |
| 2026-09-02 | `optimizer/backlog.py` | всегда title/ContactPage/H1/OG | skip, если live уже закрыл | backlog врал | чинить только открытое |
| 2026-09-02 | `main.py` weekday | 4 collect / 4 health | один collect | долгий прогон и шум на прод | будни за ~2 мин |
| 2026-09-02 | `site_health/seo.py` | теги и poisk не считались | P2: poisk без noindex; ≥50 тегов | thin URL в карте | честный P2 |
| 2026-09-02 | `analytics/analyzer.py` | warning layout.tsx без кода сайта | skip при `site_code_missing` | ложный on-page | аудит только по продy |
| 2026-09-03 | `optimizer/backlog.py` | P2 health не в таблице | live P2 (og:type, poisk, теги) в backlog | очередь расходилась с health | чинить сверху вниз |
| 2026-09-03 | журнал + Canvas | сводка 25.08 / ложный CF P1 | факты 03.09: P0=0 P1=0 P2=3, sitemap 591/141 | weekday без `besedki-seo/` | честный отчёт владельцу |

**Файл для агента:** дополнять `real-besedki-seo-agent/logs/YYYY-MM-DD_changes.md` после каждого деплоя с SEO-правками.

# Лог SEO-изменений

Каждая правка на этапе 2 — одна строка. Без «да» пользователя — не писать в лог как «сделано».

| Дата | Объект (URL / файл) | Было | Стало | Причина | Ожидаемый эффект |
|------|---------------------|------|-------|---------|------------------|
| 2026-08-25 | `sources/local.py` | fallback на create-next-app | `site_code_missing`, без скана стартера | ложные critical weekday | честный аудит прода |
| 2026-08-25 | `sources/catalog.py` | пустой каталог без json | 129 URL из sitemap | без `besedki-seo/` не проверялись карточки | 10/10 hero/GLB |
| 2026-08-25 | `site_health/viewport.py` | P1 «нет mobile-nav» | CTA «Каталог» `lg:hidden` = ок | ложный P1 | не блокировать SEO |
| 2026-08-25 | `site_health/runner.py` | CF без прокси = P0 / emergency | P1 owner_action, если origin 200 + форма/tel | ложная авария блокировала SEO | weekday идёт дальше |
| 2026-08-25 | `site_health/onpage.py` | health не видел OG/ContactPage/H1 блога | живой HTML прода в P1/P2 | журнал врал без `besedki-seo/` | честный backlog |
| 2026-09-01 | `site_health/onpage.py` | og:type=website = «нет OG» P1 | P1 только без og:image; type/hero = P2 | ложный P1 при фото модели | weekday не орёт «нет OG» |
| 2026-09-01 | `optimizer/backlog.py` | всегда title/ContactPage/крошки/H1 | skip, если live закрыто | backlog просил переписать готовое | очередь = реальные дыры |
| 2026-09-01 | `main.py` weekday | 4× health + check + report | один `collect` | долгий ложный прогон | меньше нагрузки на прод |
| 2026-09-01 | `site_health/seo.py` | sitemap не видел poisk/теги | P2 пустой поиск + ≥50 тегов | тонкие URL в карте | честный P2 |
| 2026-09-01 | `analytics/analyzer.py` | «layout.tsx слабее» без кода сайта | skip при `site_code_missing` | ложный warning | аудит только по продy |

**Файл для агента:** дополнять `real-besedki-seo-agent/logs/YYYY-MM-DD_changes.md` после каждого деплоя с SEO-правками.

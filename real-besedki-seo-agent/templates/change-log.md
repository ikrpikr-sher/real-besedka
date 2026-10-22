# Лог SEO-изменений

Каждая правка на этапе 2 — одна строка. Без «да» пользователя — не писать в лог как «сделано».

| Дата | Объект (URL / файл) | Было | Стало | Причина | Ожидаемый эффект |
|------|---------------------|------|-------|---------|------------------|
| 2026-10-22 | `/katalog/besedki-s-ostekleniem/b-31` `b-32` `b-33` | meta обрезана на 160 символах | уникальный seoDescription, priceFrom сервера | коммерческий сниппет Панорамы | цельный текст в выдаче |
| 2026-10-22 | IndexNow | — | 30 URL хабов металла и трёх карточек | Яндекс 202, IndexNow 200 | быстрее обход приоритетных страниц |
| 2026-10-22 | `site_health/server.py` | любой 5xx в хвосте лога = P0 | только строки моложе 45 минут | 502 в 06:50 UTC уже отдавал 200 | weekday не стопорится на старом логе |
| 2026-08-25 | `sources/local.py` | fallback на create-next-app | `site_code_missing`, без скана стартера | ложные critical weekday | честный аудит прода |
| 2026-08-25 | `sources/catalog.py` | пустой каталог без json | 129 URL из sitemap | без `besedki-seo/` не проверялись карточки | 10/10 hero/GLB |
| 2026-08-25 | `site_health/viewport.py` | P1 «нет mobile-nav» | CTA «Каталог» `lg:hidden` = ок | ложный P1 | не блокировать SEO |
| 2026-08-25 | `site_health/runner.py` | CF без прокси = P0 / emergency | P1 owner_action, если origin 200 + форма/tel | ложная авария блокировала SEO | weekday идёт дальше |
| 2026-08-25 | `site_health/onpage.py` | health не видел OG/ContactPage/H1 блога | живой HTML прода в P1/P2 | журнал врал без `besedki-seo/` | честный backlog |

**Файл для агента:** дополнять `real-besedki-seo-agent/logs/YYYY-MM-DD_changes.md` после каждого деплоя с SEO-правками.

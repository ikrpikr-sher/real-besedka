# Лог SEO-изменений

Каждая правка на этапе 2 — одна строка. Без «да» пользователя — не писать в лог как «сделано».

| Дата | Объект (URL / файл) | Было | Стало | Причина | Ожидаемый эффект |
|------|---------------------|------|-------|---------|------------------|
| 2026-08-25 | `sources/local.py` | fallback на create-next-app | `site_code_missing`, без скана стартера | ложные critical weekday | честный аудит прода |
| 2026-08-25 | `sources/catalog.py` | пустой каталог без json | 129 URL из sitemap | без `besedki-seo/` не проверялись карточки | 10/10 hero/GLB |
| 2026-08-25 | `site_health/viewport.py` | P1 «нет mobile-nav» | CTA «Каталог» `lg:hidden` = ок | ложный P1 | не блокировать SEO |
| 2026-08-25 | `site_health/runner.py` | CF без прокси = P0 / emergency | P1 owner_action, если origin 200 + форма/tel | ложная авария блокировала SEO | weekday идёт дальше |
| 2026-08-25 | `site_health/onpage.py` | health не видел OG/ContactPage/H1 блога | живой HTML прода в P1/P2 | журнал врал без `besedki-seo/` | честный backlog |
| 2026-09-30 | агент (PR 18 honesty) | main от 25.08 без SKU≠hub / one collect | повторно применены честные проверки | PRs 3–18 не влиты | weekday не врёт |
| 2026-09-30 | `site_health/seo.py` | 0 size hubs в карте не флаг | P2 если 4x4 indexable и hubs=0 | регресс карты 30.09 | backlog видит выпадение размеров |
| 2026-09-30 | прод sitemap | 458 / poisk вне карты / 8 hubs / 63 тега | 620 / poisk в карте без noindex / 0 hubs / 262 тега | нет кода сайта и SSH | деплой не сделан |

**Файл для агента:** дополнять `real-besedki-seo-agent/logs/YYYY-MM-DD_changes.md` после каждого деплоя с SEO-правками.

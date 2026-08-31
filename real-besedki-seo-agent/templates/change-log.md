# Лог SEO-изменений

Каждая правка на этапе 2 — одна строка. Без «да» пользователя — не писать в лог как «сделано».

| Дата | Объект (URL / файл) | Было | Стало | Причина | Ожидаемый эффект |
|------|---------------------|------|-------|---------|------------------|
| 2026-08-25 | `sources/local.py` | fallback на create-next-app | `site_code_missing`, без скана стартера | ложные critical weekday | честный аудит прода |
| 2026-08-25 | `sources/catalog.py` | пустой каталог без json | 129 URL из sitemap | без `besedki-seo/` не проверялись карточки | 10/10 hero/GLB |
| 2026-08-25 | `site_health/viewport.py` | P1 «нет mobile-nav» | CTA «Каталог» `lg:hidden` = ок | ложный P1 | не блокировать SEO |
| 2026-08-25 | `site_health/runner.py` | CF без прокси = P0 / emergency | P1 owner_action, если origin 200 + форма/tel | ложная авария блокировала SEO | weekday идёт дальше |
| 2026-08-25 | `site_health/onpage.py` | health не видел OG/ContactPage/H1 блога | живой HTML прода в P1/P2 | журнал врал без `besedki-seo/` | честный backlog |
| 2026-08-31 | `site_health/onpage.py` | og:image+type≠product = P1 «нет OG» | нет фото=P1; type/hero=P2 | ложный P1 при живом фото модели | очередь не блокируется |
| 2026-08-31 | `optimizer/backlog.py` | всегда title/ContactPage/H1/OG | skip, если live закрыт | backlog повторял закрытое | чинить только открытое |
| 2026-08-31 | `main.py` weekday | 4× health/check/report | один `collect` | прогон ~7 мин ×4 | один проход |
| 2026-08-31 | `site_health/seo.py` | не видел poisk/теги | P2 пустой поиск + tag bloat | карта 517, 221 тег | честный P2 |

**Файл для агента:** дополнять `real-besedki-seo-agent/logs/YYYY-MM-DD_changes.md` после каждого деплоя с SEO-правками.

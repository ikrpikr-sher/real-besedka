# Лог SEO-изменений

Каждая правка на этапе 2 — одна строка. Без «да» пользователя — не писать в лог как «сделано».

| Дата | Объект (URL / файл) | Было | Стало | Причина | Ожидаемый эффект |
|------|---------------------|------|-------|---------|------------------|
| 2026-08-25 | `sources/local.py` | fallback на create-next-app | `site_code_missing`, без скана стартера | ложные critical weekday | честный аудит прода |
| 2026-08-25 | `sources/catalog.py` | пустой каталог без json | 129 URL из sitemap | без `besedki-seo/` не проверялись карточки | 10/10 hero/GLB |
| 2026-08-25 | `site_health/viewport.py` | P1 «нет mobile-nav» | CTA «Каталог» `lg:hidden` = ок | ложный P1 | не блокировать SEO |
| 2026-08-25 | `site_health/runner.py` | CF без прокси = P0 / emergency | P1 owner_action, если origin 200 + форма/tel | ложная авария блокировала SEO | weekday идёт дальше |
| 2026-08-25 | `site_health/onpage.py` | health не видел OG/ContactPage/H1 блога | живой HTML прода в P1/P2 | журнал врал без `besedki-seo/` | честный backlog |
| 2026-10-19 | `site_health/onpage.py` | og:type≠product = P1 даже с фото | нет og:image = P1, тип при живом фото = P2 | ложный P1 на карточках с Product | health P1=0 |
| 2026-10-19 | `site_health/http_probe.py` | 301 не попадал в цепочку | первый статус редиректа записывается | отчёт показывал финальный 200 | видны 301 http/www |
| 2026-10-19 | IndexNow | не пинговали | 249 URL хабов и карточек, без блога | ключ на `/indexnow.txt` живой | api.indexnow.org и Яндекс 200 |
| 2026-10-19 | прод `besedki-seo` | — | деплой и seoDescription не делались | нет каталога и SSH, выборка description уже про металл | priceFrom и katalog.json не трогались |

**Файл для агента:** дополнять `real-besedki-seo-agent/logs/YYYY-MM-DD_changes.md` после каждого деплоя с SEO-правками.

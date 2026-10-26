# Лог SEO-изменений

Каждая правка на этапе 2 — одна строка. Без «да» пользователя — не писать в лог как «сделано».

| Дата | Объект (URL / файл) | Было | Стало | Причина | Ожидаемый эффект |
|------|---------------------|------|-------|---------|------------------|
| 2026-08-25 | `sources/local.py` | fallback на create-next-app | `site_code_missing`, без скана стартера | ложные critical weekday | честный аудит прода |
| 2026-08-25 | `sources/catalog.py` | пустой каталог без json | 129 URL из sitemap | без `besedki-seo/` не проверялись карточки | 10/10 hero/GLB |
| 2026-08-25 | `site_health/viewport.py` | P1 «нет mobile-nav» | CTA «Каталог» `lg:hidden` = ок | ложный P1 | не блокировать SEO |
| 2026-08-25 | `site_health/runner.py` | CF без прокси = P0 / emergency | P1 owner_action, если origin 200 + форма/tel | ложная авария блокировала SEO | weekday идёт дальше |
| 2026-08-25 | `site_health/onpage.py` | health не видел OG/ContactPage/H1 блога | живой HTML прода в P1/P2 | журнал врал без `besedki-seo/` | честный backlog |
| 2026-10-26 | `/blog/category/*` | только визуальные крошки | CollectionPage + BreadcrumbList JSON-LD | P2 schema категорий | сниппет рубрики в выдаче |
| 2026-10-26 | `bm-43`, `bm-14`, `bm-52` | пустой seoDescription | уникальный сниппет ≤250 зн. | пилот 3 карточки, цены с сервера | живой meta description |
| 2026-10-26 | `scripts/seo-daily-ship.sh` | скрипта не было | sync → fill ≤3 → push --slugs | ежедневный ship без целого katalog.json | безопасный пилот |
| 2026-10-26 | `deploy/nginx-real-besedki.ru.conf` | не было location карточки | sub_filter og:type website→product | Next 14 не умеет type=product | превью товара |
| 2026-10-26 | `verify-prod-health.sh` | FAIL без Cloudflare | Beget origin = OK | NS уже Beget, ложный UNHEALTHY | деплой не краснеет |
| 2026-10-26 | `sources/catalog.py` / onpage | в выборку попадали bytovki/ochagi | черновики исключены | 301 на /katalog давал ложный P1 OG | health не врёт |

**Файл для агента:** дополнять `real-besedki-seo-agent/logs/YYYY-MM-DD_changes.md` после каждого деплоя с SEO-правками.

# Лог SEO-изменений

Каждая правка на этапе 2 — одна строка. Без «да» пользователя — не писать в лог как «сделано».

| Дата | Объект (URL / файл) | Было | Стало | Причина | Ожидаемый эффект |
|------|---------------------|------|-------|---------|------------------|
| 2026-08-25 | `sources/local.py` | fallback на create-next-app | `site_code_missing`, без скана стартера | ложные critical weekday | честный аудит прода |
| 2026-08-25 | `sources/catalog.py` | пустой каталог без json | 129 URL из sitemap | без `besedki-seo/` не проверялись карточки | 10/10 hero/GLB |
| 2026-08-25 | `site_health/viewport.py` | P1 «нет mobile-nav» | CTA «Каталог» `lg:hidden` = ок | ложный P1 | не блокировать SEO |
| 2026-08-25 | `site_health/runner.py` | CF без прокси = P0 / emergency | P1 owner_action, если origin 200 + форма/tel | ложная авария блокировала SEO | weekday идёт дальше |
| 2026-08-25 | `site_health/onpage.py` | health не видел OG/ContactPage/H1 блога | живой HTML прода в P1/P2 | журнал врал без `besedki-seo/` | честный backlog |
| 2026-10-27 | `scripts/seo-daily-ship.sh` | скрипта не было | pull → 3 seoDescription → push --slugs | пилот без целого katalog | сниппеты bm-48, m-01, m-02 |
| 2026-10-27 | `deploy/nginx-real-besedki.ru.conf` | эталон без location карточки | website→product только на `/katalog/{cat}/{slug}` | Next 14 не умеет og:type=product | эталон = прод |
| 2026-10-27 | `api/admin/katalog/seo-descriptions` | мог заполнить все пустые | лимит 3 | запрет массовых 128 | безопасная админка |
| 2026-10-27 | `verify-prod-health.sh` | CF-прокси обязателен | Beget-direct = OK | ложный fail деплоя | weekday может выкатывать |

**Файл для агента:** дополнять `real-besedki-seo-agent/logs/YYYY-MM-DD_changes.md` после каждого деплоя с SEO-правками.

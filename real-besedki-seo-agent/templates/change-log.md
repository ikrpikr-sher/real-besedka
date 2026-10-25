# Лог SEO-изменений

Каждая правка на этапе 2 — одна строка. Без «да» пользователя — не писать в лог как «сделано».

| Дата | Объект (URL / файл) | Было | Стало | Причина | Ожидаемый эффект |
|------|---------------------|------|-------|---------|------------------|
| 2026-08-25 | `sources/local.py` | fallback на create-next-app | `site_code_missing`, без скана стартера | ложные critical weekday | честный аудит прода |
| 2026-08-25 | `sources/catalog.py` | пустой каталог без json | 129 URL из sitemap | без `besedki-seo/` не проверялись карточки | 10/10 hero/GLB |
| 2026-08-25 | `site_health/viewport.py` | P1 «нет mobile-nav» | CTA «Каталог» `lg:hidden` = ок | ложный P1 | не блокировать SEO |
| 2026-08-25 | `site_health/runner.py` | CF без прокси = P0 / emergency | P1 owner_action, если origin 200 + форма/tel | ложная авария блокировала SEO | weekday идёт дальше |
| 2026-08-25 | `site_health/onpage.py` | health не видел OG/ContactPage/H1 блога | живой HTML прода в P1/P2 | журнал врал без `besedki-seo/` | честный backlog |
| 2026-10-25 | прод `katalog.json` n-01/n-02/n-03 | пустой seoDescription | сниппет навеса, priceFrom тот же | пилот 3 карточки | уникальный meta |
| 2026-10-25 | `scripts/seo-daily-ship.sh` | скрипта не было | лимит 3, merge --slugs | регламент прогона | безопасный пилот |
| 2026-10-25 | `site_health/runner.py` | нет CF = тишина | P1 owner_action | NS Beget, origin A | не прятать LTE-риск |
| 2026-10-25 | `verify-prod-health.sh` | CF fail валил деплой | warn при живом origin | сайт на Beget NS | деплой кода не блокировать |
| 2026-10-25 | `verify-catalog-models.sh` | нет локальных GLB = fail | skip если gitignore | облачная среда без моделей | деплой кода возможен |
| 2026-10-25 | карточка `openGraph.type` | попытка `product` | `website` + nginx rewrite | Next 14 Invalid OpenGraph type | сборка не падает |

**Файл для агента:** дополнять `real-besedki-seo-agent/logs/YYYY-MM-DD_changes.md` после каждого деплоя с SEO-правками.

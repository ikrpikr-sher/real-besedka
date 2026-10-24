# Лог SEO-изменений

Каждая правка на этапе 2 — одна строка. Без «да» пользователя — не писать в лог как «сделано».

| Дата | Объект (URL / файл) | Было | Стало | Причина | Ожидаемый эффект |
|------|---------------------|------|-------|---------|------------------|
| 2026-08-25 | `sources/local.py` | fallback на create-next-app | `site_code_missing`, без скана стартера | ложные critical weekday | честный аудит прода |
| 2026-08-25 | `sources/catalog.py` | пустой каталог без json | 129 URL из sitemap | без `besedki-seo/` не проверялись карточки | 10/10 hero/GLB |
| 2026-08-25 | `site_health/viewport.py` | P1 «нет mobile-nav» | CTA «Каталог» `lg:hidden` = ок | ложный P1 | не блокировать SEO |
| 2026-08-25 | `site_health/runner.py` | CF без прокси = P0 / emergency | P1 owner_action, если origin 200 + форма/tel | ложная авария блокировала SEO | weekday идёт дальше |
| 2026-08-25 | `site_health/onpage.py` | health не видел OG/ContactPage/H1 блога | живой HTML прода в P1/P2 | журнал врал без `besedki-seo/` | честный backlog |
| 2026-10-24 | `katalog/[slug]/page.tsx` | длинный title; description из обрезанного текста | короткий title; fallback `getProductMetaDescription` | уникальный сниппет без записи 128 карточек | ISR подхватил 3 пилота |
| 2026-10-24 | `remote-deploy.sh` | NEXT_DIST_DIR=.next-staging | соседний каталог `.build` + flock | прод 2026.10.22.1 ломался на staging | безопасный деплой |
| 2026-10-24 | sitemap / poisk / redirects | poisk в карте; нет 301 sovety/b-51 | как на проде 22.10 | сироты и дубли | меньше мусора в индексе |
| 2026-10-24 | `seo-daily-ship.sh` | скрипта не было | пилот 3 slug, merge-only | 108 пустых seoDescription | b-40, b-55, b-62 |
| 2026-10-24 | `backlog.py` / `content_audit.py` | вечные P2 ContactPage/H1/OG | пропускает уже сделанное | ложный backlog | очередь = реальные дыры |

**Файл для агента:** дополнять `real-besedki-seo-agent/logs/YYYY-MM-DD_changes.md` после каждого деплоя с SEO-правками.

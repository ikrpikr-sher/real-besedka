# Лог SEO-изменений

Каждая правка на этапе 2 — одна строка. Без «да» пользователя — не писать в лог как «сделано».

| Дата | Объект (URL / файл) | Было | Стало | Причина | Ожидаемый эффект |
|------|---------------------|------|-------|---------|------------------|
| 2026-08-25 | `sources/local.py` | fallback на create-next-app | `site_code_missing`, без скана стартера | ложные critical weekday | честный аудит прода |
| 2026-08-25 | `sources/catalog.py` | пустой каталог без json | 129 URL из sitemap | без `besedki-seo/` не проверялись карточки | 10/10 hero/GLB |
| 2026-08-25 | `site_health/viewport.py` | P1 «нет mobile-nav» | CTA «Каталог» `lg:hidden` = ок | ложный P1 | не блокировать SEO |
| 2026-08-25 | `site_health/runner.py` | CF без прокси = P0 / emergency | P1 owner_action, если origin 200 + форма/tel | ложная авария блокировала SEO | weekday идёт дальше |
| 2026-08-25 | `site_health/onpage.py` | health не видел OG/ContactPage/H1 блога | живой HTML прода в P1/P2 | журнал врал без `besedki-seo/` | честный backlog |
| 2026-10-23 | `scripts/seo-daily-ship.sh` | файла не было в git | скрипт + лимит 3 | автопрогон требовал ship | пилот без целого katalog.json |
| 2026-10-23 | карточки `page.tsx` | `og:type=website` | meta `og:type=product` | Next Metadata не принимает product | не откатиться с прода |
| 2026-10-23 | admin seo-descriptions | fill всех пустых | лимит 3 | запрет массовых сниппетов | безопасный пилот |
| 2026-10-23 | `/katalog/poisk` | noindex только с `q` | всегда noindex | выдача не должна индексировать поиск | чистый индекс |
| 2026-10-23 | b-34 / b-35 / b-36 | пустой seoDescription | сниппет остекления | LaunchAgent, этот прогон не пушил повторно | 3 карточки / день |

**Файл для агента:** дополнять `real-besedki-seo-agent/logs/YYYY-MM-DD_changes.md` после каждого деплоя с SEO-правками.

# Лог SEO-изменений

Каждая правка на этапе 2 — одна строка. Без «да» пользователя — не писать в лог как «сделано».

| Дата | Объект (URL / файл) | Было | Стало | Причина | Ожидаемый эффект |
|------|---------------------|------|-------|---------|------------------|
| 2026-08-25 | `sources/local.py` | fallback на create-next-app | `site_code_missing`, без скана стартера | ложные critical weekday | честный аудит прода |
| 2026-08-25 | `sources/catalog.py` | пустой каталог без json | 129 URL из sitemap | без `besedki-seo/` не проверялись карточки | 10/10 hero/GLB |
| 2026-08-25 | `site_health/viewport.py` | P1 «нет mobile-nav» | CTA «Каталог» `lg:hidden` = ок | ложный P1 | не блокировать SEO |
| 2026-08-25 | `site_health/runner.py` | CF без прокси = P0 / emergency | P1 owner_action, если origin 200 + форма/tel | ложная авария блокировала SEO | weekday идёт дальше |
| 2026-08-25 | `site_health/onpage.py` | health не видел OG/ContactPage/H1 блога | живой HTML прода в P1/P2 | журнал врал без `besedki-seo/` | честный backlog |
| 2026-10-23 | leftover `/blog/category/{proizvodstvo,soveti,novosti,obzory,news,…}` | 200 + H1=slug | nginx/Next 301 → `/blog` | тонкие сироты вне sitemap | краулер не индексирует пустые рубрики |
| 2026-10-23 | SEO-агент honesty | main без sku_aliases/IndexNow/hub_links | стек с PR 56 + first-hop leftover | weekday показывал P2=0 при 1734 постах | честный P0/P1/P2 |
| 2026-10-23 | git ↔ прод | sitemap с poisk, OG website, без 301 B-51/loft | код как на live 2026.10.22.1 | следующий деплой с main не откатит SEO | без регресса |

**Файл для агента:** дополнять `real-besedki-seo-agent/logs/YYYY-MM-DD_changes.md` после каждого деплоя с SEO-правками.

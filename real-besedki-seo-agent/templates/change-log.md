# Лог SEO-изменений

Каждая правка на этапе 2 — одна строка. Без «да» пользователя — не писать в лог как «сделано».

| Дата | Объект (URL / файл) | Было | Стало | Причина | Ожидаемый эффект |
|------|---------------------|------|-------|---------|------------------|
| 2026-10-24 | `/katalog/besedki-osteklennye-loft/b-55`, `b-62` | meta «зона жарки» | «Мангала нет», факты каркаса и кровли, ≤160 | подстрока «мангал» в «мангала нет» | сниппет не обещает мангал |
| 2026-10-24 | `/katalog/besedki-s-mangalom/bm-42` | meta = обрезанный description | свой seoDescription, цена 650 000 не менялась | пустое поле | отдельный коммерческий сниппет |
| 2026-10-24 | `fill-seo-descriptions.mjs`, `productSeoDescription.ts` | лимит 250, ложное «мангал» | лимит 160, отрицание не считается зоной жарки | живая карточка режет meta до 160 | следующие 1–3 сниппета не обрежутся посередине |
| 2026-08-25 | `sources/local.py` | fallback на create-next-app | `site_code_missing`, без скана стартера | ложные critical weekday | честный аудит прода |
| 2026-08-25 | `sources/catalog.py` | пустой каталог без json | 129 URL из sitemap | без `besedki-seo/` не проверялись карточки | 10/10 hero/GLB |
| 2026-08-25 | `site_health/viewport.py` | P1 «нет mobile-nav» | CTA «Каталог» `lg:hidden` = ок | ложный P1 | не блокировать SEO |
| 2026-08-25 | `site_health/runner.py` | CF без прокси = P0 / emergency | P1 owner_action, если origin 200 + форма/tel | ложная авария блокировала SEO | weekday идёт дальше |
| 2026-08-25 | `site_health/onpage.py` | health не видел OG/ContactPage/H1 блога | живой HTML прода в P1/P2 | журнал врал без `besedki-seo/` | честный backlog |

**Файл для агента:** дополнять `real-besedki-seo-agent/logs/YYYY-MM-DD_changes.md` после каждого деплоя с SEO-правками.

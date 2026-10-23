# Лог SEO-изменений

Каждая правка на этапе 2 — одна строка. Без «да» пользователя — не писать в лог как «сделано».

| Дата | Объект (URL / файл) | Было | Стало | Причина | Ожидаемый эффект |
|------|---------------------|------|-------|---------|------------------|
| 2026-08-25 | `sources/local.py` | fallback на create-next-app | `site_code_missing`, без скана стартера | ложные critical weekday | честный аудит прода |
| 2026-08-25 | `sources/catalog.py` | пустой каталог без json | 129 URL из sitemap | без `besedki-seo/` не проверялись карточки | 10/10 hero/GLB |
| 2026-08-25 | `site_health/viewport.py` | P1 «нет mobile-nav» | CTA «Каталог» `lg:hidden` = ок | ложный P1 | не блокировать SEO |
| 2026-08-25 | `site_health/runner.py` | CF без прокси = P0 / emergency | P1 owner_action, если origin 200 + форма/tel | ложная авария блокировала SEO | weekday идёт дальше |
| 2026-08-25 | `site_health/onpage.py` | health не видел OG/ContactPage/H1 блога | живой HTML прода в P1/P2 | журнал врал без `besedki-seo/` | честный backlog |
| 2026-10-23 | `/katalog/besedki-s-mangalom/bm-32` | пустой seoDescription | сниппет компакт 3×2, каркас 80×80, без ЧПУ, пол фанера | вход в «беседка с мангалом» | уникальный description в выдаче |
| 2026-10-23 | `/katalog/besedki-s-mangalom/bm-12` | пустой seoDescription | сниппет 3×3, панели «орнамент», пол фанера | размер 3×3 с мангалом | уникальный description |
| 2026-10-23 | `/katalog/besedki-osteklennye-loft/b-54` | пустой seoDescription | сниппет лофт 3×3, стеклопакеты, С8, WPC | кластер остекление/лофт | уникальный description |
| 2026-10-23 | IndexNow | хабы по скрипту на сервере | +18 URL металла и 3 карточки, 32 всего, HTTP 200 | переобход коммерческих URL | быстрее учёт сниппетов |

**Файл для агента:** дополнять `real-besedki-seo-agent/logs/YYYY-MM-DD_changes.md` после каждого деплоя с SEO-правками.

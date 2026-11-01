# Лог SEO-изменений

Каждая правка на этапе 2 — одна строка. Без «да» пользователя — не писать в лог как «сделано».

| Дата | Объект (URL / файл) | Было | Стало | Причина | Ожидаемый эффект |
|------|---------------------|------|-------|---------|------------------|
| 2026-08-25 | `sources/local.py` | fallback на create-next-app | `site_code_missing`, без скана стартера | ложные critical weekday | честный аудит прода |
| 2026-08-25 | `sources/catalog.py` | пустой каталог без json | 129 URL из sitemap | без `besedki-seo/` не проверялись карточки | 10/10 hero/GLB |
| 2026-08-25 | `site_health/viewport.py` | P1 «нет mobile-nav» | CTA «Каталог» `lg:hidden` = ок | ложный P1 | не блокировать SEO |
| 2026-08-25 | `site_health/runner.py` | CF без прокси = P0 / emergency | P1 owner_action, если origin 200 + форма/tel | ложная авария блокировала SEO | weekday идёт дальше |
| 2026-08-25 | `site_health/onpage.py` | health не видел OG/ContactPage/H1 блога | живой HTML прода в P1/P2 | журнал врал без `besedki-seo/` | честный backlog |
| 2026-11-01 | `app/katalog/[category]/[slug]/page.tsx` | `og:type=website` | `og:type=product` | шаринг и ТЗ on-page | превью карточки в соцсетях |
| 2026-11-01 | `/katalog/poisk` + sitemap | поиск мог быть в индексе | `noindex,follow`, URL убран из sitemap | тонкая выдача | меньше мусора в индексе |
| 2026-11-01 | `scripts/seo-daily-ship.sh` | файла не было | пилот ≤3 seoDescription, merge по slug | ежедневный ship | сниппеты без смены цен |
| 2026-11-01 | прод katalog m-10, m-06, m-07 | пустой seoDescription | уникальный сниппет ≤250 | пилот этапа 2 | сниппет в выдаче |
| 2026-11-01 | `optimizer/backlog.py` | вечные P1 на OG/H1/ContactPage | флаги из кода/прода | backlog врал | очередь = реальный остаток |
| 2026-11-01 | `SEO-90-DAYS.md` | файла не было | план 2026-11-01…2027-01-30 | автопрогон | якорь на 90 дней |

**Файл для агента:** дополнять `real-besedki-seo-agent/logs/YYYY-MM-DD_changes.md` после каждого деплоя с SEO-правками.

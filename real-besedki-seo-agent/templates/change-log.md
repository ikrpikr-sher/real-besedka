# Лог SEO-изменений

Каждая правка на этапе 2 — одна строка. Без «да» пользователя — не писать в лог как «сделано».

| Дата | Объект (URL / файл) | Было | Стало | Причина | Ожидаемый эффект |
|------|---------------------|------|-------|---------|------------------|
| 2026-08-25 | `sources/local.py` | fallback на create-next-app | `site_code_missing`, без скана стартера | ложные critical weekday | честный аудит прода |
| 2026-08-25 | `sources/catalog.py` | пустой каталог без json | 129 URL из sitemap | без `besedki-seo/` не проверялись карточки | 10/10 hero/GLB |
| 2026-08-25 | `site_health/viewport.py` | P1 «нет mobile-nav» | CTA «Каталог» `lg:hidden` = ок | ложный P1 | не блокировать SEO |
| 2026-08-25 | `site_health/runner.py` | CF без прокси = P0 / emergency | P1 owner_action, если origin 200 + форма/tel | ложная авария блокировала SEO | weekday идёт дальше |
| 2026-08-25 | `site_health/onpage.py` | health не видел OG/ContactPage/H1 блога | живой HTML прода в P1/P2 | журнал врал без `besedki-seo/` | честный backlog |
| 2026-10-28 | `scripts/seo-daily-ship.sh` | скрипта не было | пилот ≤3 seoDescription, merge `--slugs` | ежедневный ship | 60 пустых опубликованных закрываются по 3/день |
| 2026-10-28 | прод k-01, k-02, k-03 | пустой meta description | каркас 80×80, панели ЧПУ, металлочерепица | пилот качелей | сниппет в выдаче без выдуманного остекления |
| 2026-10-28 | `lib/productSeoDescription.ts` | «без остекления» → «раздвижное остекление»; «заполняет» → «пол» | hasWord + исключение | ложь в сниппете | честный генератор |
| 2026-10-28 | `optimizer/backlog.py` | вечные P2 ContactPage/OG/H1 | живые факты health | backlog врал | очередь = то, что ещё не сделано |

**Файл для агента:** дополнять `real-besedki-seo-agent/logs/YYYY-MM-DD_changes.md` после каждого деплоя с SEO-правками.

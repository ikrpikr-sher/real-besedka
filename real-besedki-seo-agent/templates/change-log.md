# Лог SEO-изменений

Каждая правка на этапе 2 — одна строка. Без «да» пользователя — не писать в лог как «сделано».

| Дата | Объект (URL / файл) | Было | Стало | Причина | Ожидаемый эффект |
|------|---------------------|------|-------|---------|------------------|
| 2026-08-25 | `sources/local.py` | fallback на create-next-app | `site_code_missing`, без скана стартера | ложные critical weekday | честный аудит прода |
| 2026-08-25 | `sources/catalog.py` | пустой каталог без json | 129 URL из sitemap | без `besedki-seo/` не проверялись карточки | 10/10 hero/GLB |
| 2026-08-25 | `site_health/viewport.py` | P1 «нет mobile-nav» | CTA «Каталог» `lg:hidden` = ок | ложный P1 | не блокировать SEO |
| 2026-08-25 | `site_health/runner.py` | CF без прокси = P0 / emergency | P1 owner_action, если origin 200 + форма/tel | ложная авария блокировала SEO | weekday идёт дальше |
| 2026-08-25 | `site_health/onpage.py` | health не видел OG/ContactPage/H1 блога | живой HTML прода в P1/P2 | журнал врал без `besedki-seo/` | честный backlog |
| 2026-10-29 | `scripts/seo-daily-ship.sh` + `ship-seo-descriptions.mjs` | не было в main | пилот ≤3, сначала ложное остекление | ежедневный ship без целого katalog.json | честные сниппеты по 3 |
| 2026-10-29 | прод B-46, B-47, B-48 | «раздвижное остекление» | каркас 80×80, панели ЧПУ, пол фанера | «без остекл» считалось остеклением | сниппет не врёт |
| 2026-10-29 | `productSeoDescription.ts` / `fill-seo-descriptions.mjs` | «остеклен» и «фанер» без отрицания | `без остекл` и слово «пол» | ложные фичи | генератор = прод |
| 2026-10-29 | poisk + leftover + эталон nginx | git 2026.10.25.1 без noindex/301/OG | как на проде 2026.10.28.1 | будущий деплой не откатит SEO | полный deploy.sh сегодня не запускался |

**Файл для агента:** дополнять `real-besedki-seo-agent/logs/YYYY-MM-DD_changes.md` после каждого деплоя с SEO-правками.

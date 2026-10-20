# Лог SEO-изменений

Каждая правка на этапе 2 — одна строка. Без «да» пользователя — не писать в лог как «сделано».

| Дата | Объект (URL / файл) | Было | Стало | Причина | Ожидаемый эффект |
|------|---------------------|------|-------|---------|------------------|
| 2026-08-25 | `sources/local.py` | fallback на create-next-app | `site_code_missing`, без скана стартера | ложные critical weekday | честный аудит прода |
| 2026-08-25 | `sources/catalog.py` | пустой каталог без json | 129 URL из sitemap | без `besedki-seo/` не проверялись карточки | 10/10 hero/GLB |
| 2026-08-25 | `site_health/viewport.py` | P1 «нет mobile-nav» | CTA «Каталог» `lg:hidden` = ок | ложный P1 | не блокировать SEO |
| 2026-08-25 | `site_health/runner.py` | CF без прокси = P0 / emergency | P1 owner_action, если origin 200 + форма/tel | ложная авария блокировала SEO | weekday идёт дальше |
| 2026-08-25 | `site_health/onpage.py` | health не видел OG/ContactPage/H1 блога | живой HTML прода в P1/P2 | журнал врал без `besedki-seo/` | честный backlog |
| 2026-10-18 | `onpage.py`, `seo.py`, `backlog.py`, `analyzer.py`, `seo-daily-ship.sh` | P1 «нет og:image+product»; backlog снова просил ContactPage, H1 блога, BreadcrumbList, 128 title | og:image есть = не P1; og:type=website = P2; 800 городов / IndexNow 404 / SSL 35 дн. = P2; закрытые пункты не возвращаются; ship без кода — честный skip | факты прода 18.10 | следующий прогон не чинит уже живое |
| 2026-10-19 | `scripts/seo-daily-ship.sh` | stub skip без slug-пилота | fill ≤3 + `push:katalog --slugs`, цены с сервера | этап 2 | b-43, b-44, b-45 live |
| 2026-10-19 | `fill-seo-descriptions.mjs` / `productSeoDescription.ts` | «Без остекления» → бит «остекление» | исключение `без остекл` | ложный сниппет открытых беседок | фанера в базе |
| 2026-10-19 | `/indexnow.txt` | 404 | ключ 200, ping 202 на 19 URL | P2 IndexNow | хабы в очереди Яндекс/Bing |
| 2026-10-19 | SSL `real-besedki.ru` | до 2026-11-22, SAN с `m.` (NXDOMAIN) | до 2027-01-17, SAN apex+www | renew блокировал m. | сайт открывается после ноября |
| 2026-10-19 | `verify-prod-health.sh` | fail без Cloudflare cf-ray | origin Beget = ok | ложный fail деплоя | деплой не стопорится на сером облаке |
| 2026-10-19 | Next Metadata `og:type=product` | попытка в generateMetadata | Metadata API падает; extra `<meta property="og:type" content="product">` + `deploy.sh` HEALTHY | prerender whitelist Next 14 | в HTML карточки product и website |
| 2026-10-19 | `components/CatalogCard.tsx` | нет `priority` — `next build` type error | optional priority + eager на первых карточках | сборка не проходила | LCP хаба каталога |

**Файл для агента:** дополнять `real-besedki-seo-agent/logs/YYYY-MM-DD_changes.md` после каждого деплоя с SEO-правками.

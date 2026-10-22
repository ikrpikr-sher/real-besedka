# Лог SEO-изменений

Каждая правка на этапе 2 — одна строка. Без «да» пользователя — не писать в лог как «сделано».

| Дата | Объект (URL / файл) | Было | Стало | Причина | Ожидаемый эффект |
|------|---------------------|------|-------|---------|------------------|
| 2026-08-25 | `sources/local.py` | fallback на create-next-app | `site_code_missing`, без скана стартера | ложные critical weekday | честный аудит прода |
| 2026-08-25 | `sources/catalog.py` | пустой каталог без json | 129 URL из sitemap | без `besedki-seo/` не проверялись карточки | 10/10 hero/GLB |
| 2026-08-25 | `site_health/viewport.py` | P1 «нет mobile-nav» | CTA «Каталог» `lg:hidden` = ок | ложный P1 | не блокировать SEO |
| 2026-08-25 | `site_health/runner.py` | CF без прокси = P0 / emergency | P1 owner_action, если origin 200 + форма/tel | ложная авария блокировала SEO | weekday идёт дальше |
| 2026-08-25 | `site_health/onpage.py` | health не видел OG/ContactPage/H1 блога | живой HTML прода в P1/P2 | журнал врал без `besedki-seo/` | честный backlog |
| 2026-10-21 | nginx + `next.config.mjs` | B-51 остекление/мангал и `/katalog/loft` → 404 | 301 на живые URL (nginx на проде) | индексированные алиасы | сниппет не теряется |
| 2026-10-21 | агент `/proekty` | P1 «заменить ссылки на каталог» | не флаг | `/proekty` — портфолио 200 | честный backlog |
| 2026-10-21 | `sources/catalog.py` | брал `katalog.prod.json` | только `katalog.json` или sitemap | снимок 128 SKU ≠ прод 167 | без чужих priceFrom |
| 2026-10-21 | `sources/local.py` | Метрика только app/lib | ещё `components/` | счётчик в `Analytics.tsx` | нет ложного warning |
| 2026-10-21 | sitemap / poisk / sovety / хаб мангала | poisk в карте; sovety без noindex; хаб без b-76… | правки в репо | P2 | на прод не выехали: Next staging ENOENT |
| 2026-10-22 | `scripts/remote-deploy.sh` | `NEXT_DIST_DIR=.next-staging` | соседний каталог + flock | ENOENT pages-manifest | P2 выезжают |
| 2026-10-22 | `/katalog/poisk` | в sitemap, robots только с `?q=` | всегда noindex, нет в карте | пустая выдача | 2002 URL |
| 2026-10-22 | `/blog/category/sovety` | 200, H1 «sovety» | nginx 301 → `/blog` | 0 статей | сирота закрыта |
| 2026-10-22 | карточки | Metadata `og:type=website` | `<meta property="og:type" content="product">` | Next 14 не принимает product | сниппет товара |
| 2026-10-22 | `site_health/server.py` | любой 5xx в tail access.log = P0 | не агент и не старше 15 мин | 502 на рестарте PM2 | нет ложной аварии |

**Файл для агента:** дополнять `real-besedki-seo-agent/logs/YYYY-MM-DD_changes.md` после каждого деплоя с SEO-правками.

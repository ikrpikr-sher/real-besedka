# Лог SEO-изменений

Каждая правка на этапе 2 — одна строка. Без «да» пользователя — не писать в лог как «сделано».

| Дата | Объект (URL / файл) | Было | Стало | Причина | Ожидаемый эффект |
|------|---------------------|------|-------|---------|------------------|
| 2026-08-25 | `sources/local.py` | fallback на create-next-app | `site_code_missing`, без скана стартера | ложные critical weekday | честный аудит прода |
| 2026-08-25 | `sources/catalog.py` | пустой каталог без json | 129 URL из sitemap | без `besedki-seo/` не проверялись карточки | 10/10 hero/GLB |
| 2026-08-25 | `site_health/viewport.py` | P1 «нет mobile-nav» | CTA «Каталог» `lg:hidden` = ок | ложный P1 | не блокировать SEO |
| 2026-08-25 | `site_health/runner.py` | CF без прокси = P0 / emergency | P1 owner_action, если origin 200 + форма/tel | ложная авария блокировала SEO | weekday идёт дальше |
| 2026-08-25 | `site_health/onpage.py` | health не видел OG/ContactPage/H1 блога | живой HTML прода в P1/P2 | журнал врал без `besedki-seo/` | честный backlog |
| 2026-09-30 | агент honesty (PR 18–19, не влиты) | ложный P1 OG; size hub как SKU; без first_status | one collect, live backlog, SKU≠razmer, missing size hubs | weekday с main 25.08 врал | честный P0/P1/P2 |
| 2026-10-01 | `site_health/seo.py` | 1943 статьи = «посты», без P2; корневые посадочные не считались | P2 при ≥400 статей; composition.commercial | карта 620→2200, теги 0, блог раздут | backlog видит регресс |
| 2026-10-02 | агент honesty (PR 20 не влит) | main 25.08 | re-apply one collect / live backlog / blog P2 / first_status | PRs 3–20 не влиты | weekday не врёт |
| 2026-10-02 | `site_health/client.py` | выборка карточек без фильтра хабов | `is_product_catalog_path` | razmer/poisk не SKU | health не бьёт хабы как карточки |
| 2026-10-05 | `site_health/sku_aliases.py` | старый B-51 не проверялся | P1 если alias 404 без 301 | остекление/b-51 → 404, живая открытая B-51 | backlog видит потерю URL |
| 2026-10-05 | `sources/site_check.py` | поиск OK из title «B-51» | нужна href карточки `/katalog/.../b-51` | ложный OK при пустой выдаче | честный поиск |
| 2026-10-05 | `site_health/seo.py` | падение SKU 172→146 не видно | P2 при SKU &lt; 160 | карта сжалась без 301 | регресс каталога в health |
| 2026-10-06 | `optimizer/backlog.py` | health P1 писались как P2 | приоритет health сохраняется | очередь врала: B-51 404 выглядел как рост | weekday чинит P1 первым |

**Файл для агента:** дополнять `real-besedki-seo-agent/logs/YYYY-MM-DD_changes.md` после каждого деплоя с SEO-правками.

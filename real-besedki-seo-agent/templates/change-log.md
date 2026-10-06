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
| 2026-10-05 | агент honesty (main всё ещё 25.08) | ложный P1 «нет og:image» при живом фото | re-apply one collect, OG P2, blog ≥400, first hop 301 | PRs не влиты в main | weekday не ставит аварийный OG |
| 2026-10-05 | IndexNow, 35 URL | ключ на корне есть, прогон не слал | Yandex HTTP 200 | приоритетные хабы металла, не 1943 статьи | быстрее переобход коммерции |
| 2026-10-06 | агент honesty (main всё ещё 25.08) | ложный P1 «нет og:image» при живом фото | re-apply кода 05.10: one collect, OG P2, blog ≥400 | PRs не влиты в main | weekday не ставит аварийный OG |
| 2026-10-06 | IndexNow, 44 URL | накануне слали 35 | Yandex HTTP 200 `success: true` | металл, размер, хабы категорий, фанера, каркас; не 1943 статьи | переобход коммерции |

**Файл для агента:** дополнять `real-besedki-seo-agent/logs/YYYY-MM-DD_changes.md` после каждого деплоя с SEO-правками.

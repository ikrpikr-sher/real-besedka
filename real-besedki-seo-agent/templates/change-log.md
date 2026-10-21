# Лог SEO-изменений

Каждая правка на этапе 2 — одна строка. Без «да» пользователя — не писать в лог как «сделано».

| Дата | Объект (URL / файл) | Было | Стало | Причина | Ожидаемый эффект |
|------|---------------------|------|-------|---------|------------------|
| 2026-08-25 | `sources/local.py` | fallback на create-next-app | `site_code_missing`, без скана стартера | ложные critical weekday | честный аудит прода |
| 2026-08-25 | `sources/catalog.py` | пустой каталог без json | 129 URL из sitemap | без `besedki-seo/` не проверялись карточки | 10/10 hero/GLB |
| 2026-08-25 | `site_health/viewport.py` | P1 «нет mobile-nav» | CTA «Каталог» `lg:hidden` = ок | ложный P1 | не блокировать SEO |
| 2026-08-25 | `site_health/runner.py` | CF без прокси = P0 / emergency | P1 owner_action, если origin 200 + форма/tel | ложная авария блокировала SEO | weekday идёт дальше |
| 2026-08-25 | `site_health/onpage.py` | health не видел OG/ContactPage/H1 блога | живой HTML прода в P1/P2 | журнал врал без `besedki-seo/` | честный backlog |
| 2026-10-21 | `/katalog/loft`, `/katalog/loft/:slug`, алиасы B-51 | 404 | 301 на живые URL (nginx в репо + next.config) | старые коммерческие адреса | вес и клики на карточку |
| 2026-10-21 | карточки `og:type` | только website | первый meta `product` (Next 14 не принимает type в Metadata) | шаринг и health | соцсети видят товар |
| 2026-10-21 | seoDescription b-60, b-61, b-73 | пусто | сниппет с фанерой и каркасом 80×80 | пилот 3 карточки, цены с сервера | уникальный сниппет открытых беседок |
| 2026-10-21 | `verify-catalog-models.sh` / `verify-prod-health.sh` | деплой падал без локальных GLB и из‑за grey cloud | skip GLB + warn CF | среда агента без медиа | `deploy.sh` доходит до прод |

**Файл для агента:** дополнять `real-besedki-seo-agent/logs/YYYY-MM-DD_changes.md` после каждого деплоя с SEO-правками.

# Лог SEO-изменений

Каждая правка на этапе 2 — одна строка. Без «да» пользователя — не писать в лог как «сделано».

| Дата | Объект (URL / файл) | Было | Стало | Причина | Ожидаемый эффект |
|------|---------------------|------|-------|---------|------------------|
| 2026-08-25 | `sources/local.py` | fallback на create-next-app | `site_code_missing`, без скана стартера | ложные critical weekday | честный аудит прода |
| 2026-08-25 | `sources/catalog.py` | пустой каталог без json | 129 URL из sitemap | без `besedki-seo/` не проверялись карточки | 10/10 hero/GLB |
| 2026-08-25 | `site_health/viewport.py` | P1 «нет mobile-nav» | CTA «Каталог» `lg:hidden` = ок | ложный P1 | не блокировать SEO |
| 2026-08-25 | `site_health/runner.py` | CF без прокси = P0 / emergency | P1 owner_action, если origin 200 + форма/tel | ложная авария блокировала SEO | weekday идёт дальше |
| 2026-08-25 | `site_health/onpage.py` | health не видел OG/ContactPage/H1 блога | живой HTML прода в P1/P2 | журнал врал без `besedki-seo/` | честный backlog |
| 2026-10-22 | nginx карточки `/katalog/{cat}/{slug}` | Next отдаёт `og:type=website` | sub_filter → `product` только на карточках | Next 14 отклоняет type=product в Metadata | шаринг и health видят product |
| 2026-10-22 | `api/admin/katalog/seo-descriptions` | fill всех пустых | лимит 3 | запрет массовых 100+ description | пилот безопасен из админки |
| 2026-10-22 | `scripts/seo-daily-ship.sh` | скрипта не было | sync + 3 slug + skip LaunchAgent | ежедневный пилот seoDescription | 3 карточки/день, не целый json |
| 2026-10-22 | `verify-catalog-models.sh` | нет локальных GLB = fail деплоя | warn, если `*.glb` в rsync-exclude | облачный агент без моделей | деплой кода без заливки GLB |
| 2026-10-22 | `optimizer/backlog.py` + `content_audit.py` | вечные P2 ContactPage / slug-H1 | только живые дыры | ложный backlog | агент чинит то, что ещё сломано |

**Файл для агента:** дополнять `real-besedki-seo-agent/logs/YYYY-MM-DD_changes.md` после каждого деплоя с SEO-правками.

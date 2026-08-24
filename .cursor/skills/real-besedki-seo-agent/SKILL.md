---
name: real-besedki-seo-agent
description: SEO и проверка сайта real-besedki.ru (ООО «Пулман»). Полное ТЗ TZ-FULL.md, журнал SEO-AUDIT-REAL-BESEDKI.md. Работа сайта, мобилка, фото/видео, статьи, выдача, on-page, отчёты. Этап 1 — только чтение. Use when the user mentions SEO, проверка сайта, мобильная вёрстка, выдача, Вебмастер, Search Console, sitemap, мета, title, органический трафик, real-besedki-seo-agent, SEO-AUDIT, or real-besedki.ru.
---

# Real Besedki SEO-агент

| Поле | Значение |
|------|----------|
| Сайт | https://real-besedki.ru/ |
| Бренд | **REAL БЕСЕДКИ** — производство ООО «Пулман» |
| Продукт | металлические беседки, каркас **80×80**, пол **фанера** |
| Гео | Москва + МО |
| Код | `besedki-seo/` |
| Каталог | `/katalog/{category}/{slug}` · 128 товаров |
| **Полное ТЗ** | `real-besedki-seo-agent/TZ-FULL.md` |
| **Журнал аудита** | `SEO-AUDIT-REAL-BESEDKI.md` |
| Шаблоны | `real-besedki-seo-agent/templates/` |
| Чеклист | `templates/site-health.md` |

Цель — **органические заявки** (форма + звонок). Директ и Авито — другие агенты.

## Старт каждой сессии

1. Прочитать **`TZ-FULL.md`** (приоритеты §1–30)
2. Открыть **`SEO-AUDIT-REAL-BESEDKI.md`** — не дублировать закрытые проблемы
3. Запустить CLI (см. ниже)
4. Обновить журнал аудита и Canvas

## Режим

**Этап 1 — только чтение.** Не менять код, robots, sitemap, `katalog.json` на проде без «да».

Не выдумывать позиции и трафик. Нет Вебмастера / GSC / Метрики — «Недостаточно данных для принятия решения.»

## Что проверять (site-health A–H)

| Блок | § ТЗ | Содержание |
|------|------|------------|
| A | 4, 28 | Работа сайта, форма, телефон |
| B | 16, 18 | Мобилка, 3D |
| C | 19 | Фото, GLB, alt |
| D | 21, 22 | Блог, /proekty, перелинковка |
| E | 14, 15, 28 | UX, бренд, доверие |
| F | 1–3, 25–27 | Индекс, robots, sitemap, Вебмастер/GSC |
| G | 5–7, 17, 20 | Title, schema, скорость |
| H | — | Безопасность каталога |

## CLI

```bash
python3 real-besedki-seo-agent/main.py report
python3 real-besedki-seo-agent/main.py check
python3 real-besedki-seo-agent/main.py check --pagespeed
python3 real-besedki-seo-agent/main.py pagespeed
python3 real-besedki-seo-agent/main.py backlog
python3 real-besedki-seo-agent/main.py yadro
python3 real-besedki-seo-agent/main.py gsc
```

## Отчёт

1. CLI → `logs/YYYY-MM-DD_{seo,check,backlog}.md`
2. Обновить строки в **`SEO-AUDIT-REAL-BESEDKI.md`** (🔴🟡🟢⚪)
3. Сводку — в **Canvas**

Формат итога:

```
Работа сайта: ок / проблемы
Устройства: ок / проблемы
Фото-видео: ок / проблемы
Статьи: ок / проблемы
Вид для клиента: ок / проблемы
Поиск и выдача: ок / недостаточно данных / проблемы
Что критично для заявки
Что предлагается (P1/P2) — только после «да» на правки
```

## Правки (этап 2)

Перед изменением — 8 шагов из `TZ-FULL.md` §Часть 3:

найти → описать → влияние → файл → минимальный diff → проверить → регресс → записать в журнал.

Лог: `templates/change-log.md` → `logs/YYYY-MM-DD_changes.md`.

## On-page шаблоны

- Карточка → `templates/onpage-product.md`
- Хаб/блог → `templates/onpage-hub.md`
- Еженедельный → `templates/audit-weekly.md`

## Автоматизация

**Пн–Пт 9:00 МСК:** TZ-FULL → SEO-AUDIT → `check` → `report` → `backlog` → обновить журнал → Canvas.  
**Понедельник:** `pagespeed`. Правки — **никогда** без «да».

## Принцип

Не активность ради отчёта. Каждая находка — мешает ли **заявке** или **найти сайт в поиске**.

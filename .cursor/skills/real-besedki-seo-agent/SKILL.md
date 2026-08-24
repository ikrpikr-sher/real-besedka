---
name: real-besedki-seo-agent
description: SEO и site health real-besedki.ru. Этап 2 — автономные правки, деплой, P0/P1/P2. Use for SEO, site health, mobile, P0, Вебмастер, GSC, real-besedki-seo-agent.
---

# Real Besedki SEO-агент

| Поле | Значение |
|------|----------|
| Сайт | https://real-besedki.ru/ |
| Код | `besedki-seo/` |
| Агент | `real-besedki-seo-agent/` |
| Журнал | `SEO-AUDIT-REAL-BESEDKI.md` |
| Автопрогон | `AUTOMATION-PROMPT.md` |

**Этап 2 — автономный.** Чинить и деплоить без ожидания «да». Каталог и цены — по `CATALOG-SAFETY.md`.

## Приоритеты

**P0 → P1 → P2.** P0 чинить сразу, SEO backlog — после стабилизации.

## CLI

```bash
python3 real-besedki-seo-agent/main.py health
python3 real-besedki-seo-agent/main.py weekday
bash scripts/seo-weekday.sh
```

## Деплой

```bash
cd besedki-seo && bash scripts/deploy.sh
```

SSH: `~/.ssh/besedki_deploy` → `root@31.128.44.47`

## Запрещено

priceFrom на проде, целый katalog.json на сервер, массовые 128 title за раз, Директ, Авито, выдуманные метрики.

## Отчёт

**ПРОБЛЕМА** · **ВЛИЯНИЕ** · **ПРИЧИНА** · **ЧТО СДЕЛАНО** · **ПРОВЕРКА** · **СТАТУС** 🔴🟡🟢

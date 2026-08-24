---
name: real-besedki-seo-agent
description: SEO и проверка сайта real-besedki.ru (ООО «Пулман»). Site Health P0/P1/P2, TZ-FULL.md, SEO-AUDIT. Работа сайта, мобилка, доступность, заявки. Use when the user mentions SEO, проверка сайта, мобильная вёрстка, site health, P0, выдача, Вебмастер, Search Console, real-besedki-seo-agent, or real-besedki.ru.
---

# Real Besedki SEO-агент

| Поле | Значение |
|------|----------|
| Сайт | https://real-besedki.ru/ |
| Бренд | **REAL БЕСЕДКИ** — ООО «Пулман» |
| Продукт | металлические беседки, каркас **80×80**, пол **фанера** |
| **Модернизация** | `real-besedki-seo-agent/TZ-MODERNIZATION.md` |
| **Полное ТЗ** | `real-besedki-seo-agent/TZ-FULL.md` |
| **Журнал** | `SEO-AUDIT-REAL-BESEDKI.md` |
| **Автопрогон** | `real-besedki-seo-agent/AUTOMATION-PROMPT.md` |

Цель — **органические заявки** (форма + звонок). **Доступность сайта важнее SEO.**

## Приоритеты

**P0 → P1 → P2.** При P0 — аварийный режим, SEO backlog не трогать.

## Старт каждой сессии

1. `TZ-MODERNIZATION.md` + `TZ-FULL.md`
2. `SEO-AUDIT-REAL-BESEDKI.md`
3. CLI (см. ниже) — **сначала `health`**
4. Обновить журнал и Canvas

## CLI

```bash
python3 real-besedki-seo-agent/main.py health      # P0 первым
python3 real-besedki-seo-agent/main.py weekday       # полный будничный прогон
python3 real-besedki-seo-agent/main.py check
python3 real-besedki-seo-agent/main.py report
python3 real-besedki-seo-agent/main.py backlog
python3 real-besedki-seo-agent/main.py pagespeed     # понедельник
bash scripts/seo-weekday.sh                        # cron / automation
```

## Site Health (`site_health/`)

DNS, 4 домена, SSL, UA (iPhone/Android/bots), UTM/yclid, robots, sitemap, canonical, форма, tel:, CDN, SSH-логи, viewport-сигналы.

Логи: `logs/YYYY-MM-DD_health.{md,json}`

## Автоматизация (будни)

**Пн–Пт 9:00 МСК:** `weekday` или `scripts/seo-weekday.sh`  
Инструкции: `AUTOMATION-PROMPT.md`

## Режим

Этап 1 — чтение. P0 можно чинить **только** если причина однозначна, минимальный diff, backup, без цен/каталога/дизайна.

Нет Вебмастера/GSC/Метрики — «Недостаточно данных для принятия решения.»

## Отчёт владельцу (P0)

**ПРОБЛЕМА** · **ВЛИЯНИЕ** · **ПРИЧИНА** (факт/гипотеза) · **ЧТО СДЕЛАНО** · **ПРОВЕРКА** · **СТАТУС** 🔴🟡🟢

## Принцип

> Может ли покупатель открыть сайт с телефона и оставить заявку?

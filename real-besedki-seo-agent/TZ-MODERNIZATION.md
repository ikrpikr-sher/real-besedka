# ТЗ: модернизация SEO-агента REAL БЕСЕДКИ

**Статус:** внедрено 2026-08-24  
**Агент:** `real-besedki-seo-agent` (расширение, не второй агент)

## Реализация

| Пункт ТЗ | Статус | Где |
|----------|--------|-----|
| P0 / P1 / P2 | ✅ | `site_health/runner.py`, `site_health/models.py` |
| Модуль site_health | ✅ | `real-besedki-seo-agent/site_health/` |
| DNS A/AAAA/NS/CNAME | ✅ | `site_health/dns.py` |
| 4 варианта домена | ✅ | `site_health/domains.py` |
| Внутренние URL | ✅ | `site_health/client.py` |
| User-Agent (7 ботов) | ✅ | `site_health/user_agents.py` |
| UTM/yclid/gclid | ✅ | `site_health/user_agents.py` |
| SSL/TLS | ✅ | `site_health/ssl_check.py` |
| robots/sitemap/canonical/noindex | ✅ | `site_health/seo.py` |
| Форма + tel: (без отправки) | ✅ | `site_health/client.py` |
| CDN/Cloudflare headers | ✅ | `site_health/client.py` |
| Аварийный режим P0 | ✅ | `main.py health`, `traffic_light.py` |
| Отчёт владельцу | ✅ | `site_health/report.py` |
| CLI `health` | ✅ | `python3 real-besedki-seo-agent/main.py health` |
| Интеграция в check/report | ✅ | `main.py` |
| SSH/server logs | ⏳ | нет доступа из CLI по умолчанию |
| Авто-исправление P0/P1 | ✅ | Этап 2: AUTOMATION-PROMPT.md, actions.py |
| Viewport 375–1920 | ⏳ | этап 2 (Playwright) |
| JS console errors | ⏳ | этап 2 (Playwright) |

## Команды

```bash
python3 real-besedki-seo-agent/main.py health   # P0 первым
python3 real-besedki-seo-agent/main.py check    # health + site_check
python3 real-besedki-seo-agent/main.py report   # полный аудит + health
```

## Порядок

**P0 → P1 → P2**. При P0 — SEO-задачи приостанавливаются (`emergency_mode`).

## Логи

`real-besedki-seo-agent/logs/YYYY-MM-DD_health.{md,json}`

## Журнал

`SEO-AUDIT-REAL-BESEDKI.md` — колонка P0, формат §29 ТЗ.

---

Полный текст требований — в сообщении владельца от 2026-08-24 (§1–33).

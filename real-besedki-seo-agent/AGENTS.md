# Real Besedki SEO Agent

Локальный SEO-движок для **https://real-besedki.ru/** (код в `besedki-seo/`).

## Быстрый старт

```bash
cd /Users/user/real-besedka
python3 real-besedki-seo-agent/main.py health      # P0 site health (первым!)
python3 real-besedki-seo-agent/main.py report      # аудит + светофор + check
python3 real-besedki-seo-agent/main.py check      # полная проверка прода
python3 real-besedki-seo-agent/main.py pagespeed  # PageSpeed mobile (weekly)
python3 real-besedki-seo-agent/main.py backlog
```

## Шаблоны (`templates/`)

| Файл | Когда использовать |
|------|-------------------|
| `report.md` | Ежедневный отчёт — CLI подставляет данные автоматически |
| `onpage-product.md` | Title/description/OG для `/katalog/.../slug` |
| `onpage-hub.md` | Главная, категории, блог, услуги |
| `change-log.md` | Лог правок после этапа 2 |
| `templates/audit-weekly.md` | Еженедельный сжатый чеклист |
| `templates/site-health.md` | Полная проверка: работа, мобилка, фото, статьи, выдача |
| `templates/backlog.md` | Команда backlog |

## Cursor

- Скилл: `.cursor/skills/real-besedki-seo-agent/SKILL.md`
- Правило: `.cursor/rules/real-besedki-seo-agent.mdc`
- Полное ТЗ: `TZ-FULL.md` · краткий указатель: `TZ.md`
- Журнал аудита: `../SEO-AUDIT-REAL-BESEDKI.md`

## Режим

**Этап 1 — только чтение.** Правки — только после «да».

# SEO-аудит — real-besedki.ru

**Сайт:** https://real-besedki.ru/  
**Бренд:** REAL БЕСЕДКИ · ООО «Пулман»  
**Полное ТЗ:** `real-besedki-seo-agent/TZ-FULL.md`  
**Последнее обновление:** 2026-10-29  
**Режим:** этап 2 — **автономные правки**

---

## Сводка прогона 2026-10-29

| Метрика | Значение |
|---------|----------|
| Живой сайт | **2026.10.29.1** · BUILD_ID `Ps-7AE-pwkOPjClT2CVOn` |
| iPhone UA главная | 200 · form · `tel:+74952555477` · viewport |
| Health до правок | **P0=0 · P1=0 · P2=1** (1425 блог — не чистить массово) |
| Светофор | открыть ✓ · товар ✓ · заявка ✓ · выдача техника ✓ |
| Sitemap | 1699 URL · SKU 167 · блог 1425 · теги 0 · размер 0 · коммерция 57 · **poisk 0** |
| SSL | LE YR2 до **2027-01-17** (79 дней) |
| NS | Beget · origin 31.128.44.47 · без cf-* |
| katalog.json | md5 после деплоя `b5c8f12221afe3add10df4bfd0bff26f` · 193 поз. · seoDescription 107 · **не трогали** |
| IndexNow | 96 URL, poisk out · api.indexnow.org 200 · Bing 200 |
| Органика / заявки | Недостаточно данных (нет Вебмастера / GSC / Метрики) |

---

## Журнал проблем

| Приоритет | Проблема | URL / объект | Что исправлено | Статус |
|-----------|----------|--------------|----------------|--------|
| P2 | Неизвестная рубрика блога = 200 + латинский H1 | `/blog/category/{slug}` | `notFound()` если нет в живых рубриках | 🟢 |
| P2 | Алиасы `uhod` / `montazh` | `/blog/category/uhod`, `/montazh` | 301 → `/blog/category/montazh-i-uhod` (nginx + Next) | 🟢 |
| P2 | 1425 URL статей блога в sitemap | sitemap | не массово удалять за прогон | 🟡 |
| P1 | `/katalog/poisk` в sitemap, без noindex | поиск | noindex + исключение из sitemap | 🟢 |
| P2 | leftover-рубрики 200 + латинский H1 | `/blog/category/{materialy,ukhod,…}` | 301 → `/blog` | 🟢 |
| P2 | Хаб мангал: JSON-LD 20 / сетка без b-76… | `/katalog/besedki-s-mangalom` | ItemList 39 + сетка 39 | 🟢 |
| P1 | Нет данных Вебмастера / GSC / Метрики | кабинеты | — | ⚪ |
| P1 | Яндекс Бизнес / Google Business | off-page | — | ⚪ |
| P1 | Метрика: цели форма + телефон | metrika `111500128` | счётчик на проде (lazyOnload); целей нет в выгрузке | ⚪ |
| P1 | Cloudflare proxy (owner) | DNS | NS Beget, origin 200 — не блокируем SEO | 🟡 |
| P2 | Поле seoDescription в админке | каталог | 107/193 уже заполнены; пилот по 3/день | 🟡 |
| P2 | www/http | домен | 301 на https://real-besedki.ru/ | 🟢 |
| P1 | Товарный OG | карточки | live `og:type=product` + фото модели (nginx location) | 🟢 |
| P2 | ContactPage | `/kontakty` | JSON-LD есть | 🟢 |
| P1 | Title карточек | каталог | уникальны: модель + размер + цена «от» | 🟢 |
| P1 | H1 рубрик в sitemap | блог | 11/11 по-русски | 🟢 |

**Легенда:** 🔴 Не исправлено · 🟡 В работе · 🟢 Исправлено / снято · ⚪ Требуется решение владельца

---

## Что уже OK (2026-10-29)

| Проверка | Статус |
|----------|--------|
| Главная, каталог, блог, контакты, `/proekty` 200 | 🟢 |
| B-51 `/katalog/otkrytye-besedki/b-51` 200; старые glazed/mangal 301 | 🟢 |
| leftover sovety/materialy/ukhod → `/blog` 301 | 🟢 |
| неизвестные рубрики (`akcii`, `faq`, `poleznoe`…) → 404 | 🟢 |
| `uhod` / `montazh` → 301 «Монтаж и уход» | 🟢 |
| Форма + `tel:+74952555477` | 🟢 |
| SSL YR2 до 2027-01-17, HSTS | 🟢 |
| Product OG + BreadcrumbList + Product schema | 🟢 |
| Хабы каталога: сетка = JSON-LD = sitemap | 🟢 |

---

## Очередь

### Владелец

1. Выгрузки Вебмастер + GSC + Метрика (цели форма / телефон).
2. Яндекс Бизнес / Google Business Profile.
3. `PAGESPEED_API_KEY` (понедельник PSI).
4. Не включать Cloudflare orange-cloud как P1, пока NS Beget и origin 200.
5. Не массово вычищать 1425 URL блога из sitemap за один прогон.

### On-page дальше

6. Пилот `seoDescription`: ещё ~86 карточек, по 1–3 за день, priceFrom с сервера.
7. Следить, чтобы деплой nginx не ронял location карточки (`og:type=product`).

---

## История изменений

| Дата | Объект | Было | Стало | Причина | Статус |
|------|--------|------|-------|---------|--------|
| 2026-08-24 | ТЗ | краткий TZ.md | TZ-FULL.md + этот журнал | внедрение полного ТЗ | 🟢 |
| 2026-10-27 | прод | 2026.10.26.1 | 2026.10.27.2 | рубрики блога, сниппеты, IndexNow | 🟢 |
| 2026-10-28 | poisk / leftover / хаб мангал | poisk в карте; 4 latin H1; ItemList 20 | noindex; 301 leftover; полный ItemList | weekday P2 | 🟢 |
| 2026-10-29 | неизвестные рубрики блога | любой slug 200 + H1=slug | 404; `uhod`/`montazh` 301 | weekday P2 soft-404 | 🟢 |

---

*Обновлять после каждого прогона агента: `python3 real-besedki-seo-agent/main.py report`*

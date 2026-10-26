# SEO-аудит — real-besedki.ru

**Сайт:** https://real-besedki.ru/  
**Бренд:** REAL БЕСЕДКИ · ООО «Пулман»  
**Полное ТЗ:** `real-besedki-seo-agent/TZ-FULL.md`  
**Последнее обновление:** 2026-10-26 06:28 UTC  
**Режим:** этап 2 — **автономные правки**  
**Версия сайта:** 2026.10.26.1 · BUILD_ID `xdC1s8eVl1iQWS8h3jIaS`

---

## Сводка прогона 2026-10-26 (понедельник)

| Метрика | Значение |
|---------|----------|
| Ключевые маршруты | главная / каталог / контакты / портфолио / B-51 — 200 |
| iPhone UA | 200 · form · `tel:+74952555477` · viewport |
| Sitemap | **1699** URL · SKU 167 · статьи 1425 · теги 0 · коммерческие 57 · poisk **нет** |
| Светофор клиента | открыть ✓ · товар ✓ · заявка ✓ · выдача техника ✓ |
| Health после деплоя | **P0=0 · P1=0 · P2=1** (1425 постов; poisk и мангал закрыты) |
| SSL | LE YR2 до 2027-01-17, **82 дня** |
| IndexNow | 96 URL, poisk нет; api.indexnow.org 200, Bing 200 |
| PageSpeed mobile | **Недостаточно данных** (PSI 429, нет `PAGESPEED_API_KEY`) |
| Органика / индекс / заявки | Недостаточно данных (нет Вебмастера / GSC / Метрики) |

---

## Журнал проблем

| Приоритет | Проблема | URL / объект | Что исправлено | Статус |
|-----------|----------|--------------|----------------|--------|
| P2 | `/katalog/poisk` в sitemap без noindex | поиск | всегда `noindex,follow`, убран из sitemap | 🟢 |
| P2 | H1 рубрик блога = slug | 6 категорий в sitemap | человеческие title/H1 | 🟢 |
| P2 | Хаб мангала: 19 SKU только в sitemap | `/katalog/besedki-s-mangalom` | ItemList без среза 20 | 🟢 |
| P2 | 1425 URL статей в sitemap | `/sitemap.xml` | не трогаем массово | 🟡 |
| P1 | Нет данных Вебмастера / GSC / Метрики | кабинеты | — | ⚪ |
| P1 | Яндекс Бизнес / Google Business | off-page | — | ⚪ |
| P1 | Метрика: цели форма + телефон | metrika `111500128` | счётчик на проде есть; целей нет в выгрузке | ⚪ |
| P2 | Cloudflare orange-cloud | DNS | NS **Beget**, origin 200 — не P1 | 🟢 |
| P1 | Товарный OG | карточки | live `og:type=product` + photo | 🟢 |
| P2 | ContactPage / BreadcrumbList | `/kontakty`, `/katalog` | на проде есть | 🟢 |
| P0 | Сайт / форма / SSL | прод | 200, форма, tel, SSL 82 дня | 🟢 |

**Легенда:** 🔴 Не исправлено · 🟡 В работе · 🟢 Исправлено / снято · ⚪ Требуется решение владельца

---

## Что уже OK (2026-10-26)

| Проверка | Статус |
|----------|--------|
| Главная, каталог, блог, контакты, `/proekty` портфолио | 🟢 |
| B-51 live `/katalog/otkrytye-besedki/b-51`; старые glazed/mangal/loft **301** | 🟢 |
| Leftover blog cats (`sovety`, `proizvodstvo`, …) **301 → /blog** | 🟢 |
| Size hubs 3×3/4×4: 200, `noindex, follow`, не в sitemap | 🟢 |
| http/www first hop **301** → https://real-besedki.ru/ | 🟢 |
| robots.txt + Sitemap | 🟢 |
| Title карточек уникальны (B-51: модель + размер + цена «от») | 🟢 |
| NS Beget, A 31.128.44.47, без cf-* | 🟢 |

---

## Очередь

### Владелец

1. Выгрузки Вебмастер + GSC + Метрика (цели форма / телефон).
2. `PAGESPEED_API_KEY` для понедельничного PSI.
3. Яндекс Бизнес / Google Business Profile.
4. Не включать Cloudflare orange-cloud как P1, пока NS Beget и origin 200.
5. Не удалять 1425 постов блога из sitemap одним прогоном.

### On-page / агент

6. После деплоя — проверить poisk noindex и отсутствие в sitemap.
7. Мангал-хаб: сетка по-прежнему режет визуально; вес через JSON-LD ItemList.
8. Пилот `seoDescription` — макс. 3 карточки, `CATALOG-SAFETY.md`.

---

## История изменений

| Дата | Объект | Было | Стало | Причина | Статус |
|------|--------|------|-------|---------|--------|
| 2026-10-26 | poisk / рубрики / ItemList / deploy | регресс main | v2026.10.26.1 | weekday P2 + безопасный деплой | 🟢 |
| 2026-10-23 | leftover blog cats + honesty | 200 H1=slug | nginx 301 → /blog | тонкие сироты | 🟢 |
| 2026-10-22 | product OG на live | website | product + photo | шаринг карточек | 🟢 |
| 2026-08-25 | health CF / onpage | CF = P0 | P1 owner / снят | ложная авария | 🟢 |

---

*Обновлять после каждого прогона: `python3 real-besedki-seo-agent/main.py weekday`*

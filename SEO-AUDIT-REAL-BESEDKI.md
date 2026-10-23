# SEO-аудит — real-besedki.ru

**Сайт:** https://real-besedki.ru/  
**Бренд:** REAL БЕСЕДКИ · ООО «Пулман»  
**Полное ТЗ:** `real-besedki-seo-agent/TZ-FULL.md`  
**Последнее обновление:** 2026-10-23 06:15 UTC  
**Режим:** этап 2 — **автономные правки**

---

## Сводка прогона 2026-10-23

| Метрика | Значение |
|---------|----------|
| Ключевые маршруты | 7/7 OK |
| Карточки (выборка) | 10/10 OK · hero 10/10 · GLB 10/10 |
| Sitemap | 2002 URL · SKU 167 · посты 1734 · коммерческие 57 · poisk нет · razmer нет |
| Светофор клиента | открыть ✓ · товар ✓ · заявка ✓ · выдача техника ✓ |
| P0 | 0 |
| P1 health | 0 |
| P2 health | 1 (1734 URL блога в sitemap — не удалять пачкой) |
| Живой сайт | VERSION **2026.10.22.1** · BUILD_ID `U-dw0XaVCJEixaxYd4SMy` |
| Органика / индекс / заявки | Недостаточно данных (нет Вебмастера / GSC / Метрики) |

---

## Журнал проблем

| Приоритет | Проблема | URL / объект | Что исправлено | Статус |
|-----------|----------|--------------|----------------|--------|
| P2 | 1734 URL статей в sitemap | sitemap.xml | не трогать пачкой за прогон | 🟡 |
| P2 | Пустые leftover-рубрики блога 200 + H1=slug | `/blog/category/{proizvodstvo,soveti,novosti,obzory,news,…}` | nginx 301 → `/blog` 23.10 | 🟢 |
| P2 | `/blog/category/sovety` 200 | блог | 301 → `/blog` (уже на проде 22.10) | 🟢 |
| P1 | Товарный Open Graph | карточки | live `og:type=product` + og:image модели | 🟢 |
| P1 | B-51 остекление/мангал и `/katalog/loft` 404 | редиректы | 301 на текущие URL | 🟢 |
| P1 | `/katalog/poisk` в sitemap / без noindex | поиск | noindex, не в sitemap | 🟢 |
| P1 | Title карточек не уникальны | каталог | live: модель + размер + цена «от» | 🟢 |
| P1 | 54 ссылки на `/proekty` в блоге | блог | `/proekty` = 200 портфолио, не битая ссылка | 🟢 |
| P1 | Cloudflare без прокси | DNS | NS Beget, origin 200 — не авария | 🟢 |
| P1 | Нет данных Вебмастера / GSC / Метрики | кабинеты | — | ⚪ |
| P1 | Яндекс Бизнес / Google Business | off-page | — | ⚪ |
| P1 | Метрика: цели «форма» + «телефон» | metrika.yandex.ru | счётчик `111500128` на проде; целей нет в выгрузке | ⚪ |
| P2 | BreadcrumbList на `/katalog` | хаб | live есть | 🟢 |
| P2 | ContactPage на `/kontakty` | контакты | live есть | 🟢 |
| P2 | H1 категорий блога — slug | sitemap-рубрики | live человекочитаемые | 🟢 |
| P2 | www/http/слеш | домен | первый hop 301 на https://real-besedki.ru/ | 🟢 |

**Легенда:** 🔴 Не исправлено · 🟡 В работе · 🟢 Исправлено / снято · ⚪ Требуется решение владельца

---

## Что уже OK (2026-10-23)

| Проверка | Статус |
|----------|--------|
| Главная, каталог, блог, контакты, услуги, о компании | 🟢 |
| iPhone UA: 200, form, `tel:+74952555477`, viewport | 🟢 |
| Поиск B-51 / В51 | 🟢 |
| Hero-фото и GLB (выборка 10) | 🟢 |
| robots.txt + sitemap 2002 | 🟢 |
| SSL LE YR2 до 2027-01-17 (85 дней) | 🟢 |
| og:type=product + og:image на карточках | 🟢 |
| ContactPage, BreadcrumbList, H1 рубрик из sitemap | 🟢 |
| Leftover-рубрики блога → 301 /blog | 🟢 |

---

## Последний прогон (2026-10-23 06:15 UTC)

- Health (honesty): **P0=0 · P1=0 · P2=1** (1734 поста)
- iPhone UA главная: **200**, form + tel + viewport
- Светофор: открыть ✓ · товар ✓ · заявка ✓ · выдача техника ✓
- Маршруты **7/7** · карточки **10/10**
- Sitemap: SKU 167 (osteklenie 20, open 29, mangal 39, pavilony 15, navesy 8, kacheli 36, mangaly 15, loft 5)
- Leftover first hop: proizvodstvo/soveti/novosti/obzory/news **301 → /blog**; stili/sravneniya **200**
- IndexNow: 96 URL, poisk нет; api.indexnow.org 200, Bing 200
- PageSpeed: пятница, не запускался
- katalog.json на проде md5 `1be830c01fe0ab043d624ae5f861921b` (админка могла менять)

---

## Очередь

### Владелец

1. Выгрузки Вебмастер + GSC + Метрика (цели форма / телефон).
2. Яндекс Бизнес / Google Business.
3. `PAGESPEED_API_KEY` для понедельничного PSI.
4. Не открывать Cloudflare orange-cloud как P1, пока NS Beget и origin 200.

### On-page

5. 1734 URL блога — не удалять пачкой. Отдельный план по noindex шаблонных серий.
6. Не деплоить main без редиректов B-51/loft/sovety и без `og:type=product` — регресс.

---

## История изменений

| Дата | Объект | Было | Стало | Причина | Статус |
|------|--------|------|-------|---------|--------|
| 2026-10-23 | leftover blog cats | 200 + H1=slug | nginx 301 → /blog | тонкие сироты вне sitemap | 🟢 |
| 2026-10-23 | SEO-агент | main без honesty | honesty PR 56 + first-hop leftover | weekday врал P2=0 | 🟢 |
| 2026-10-22 | poisk / sovety / OG | poisk в карте; sovety 200; type=website в git | live noindex + 301 + product | P1/P2 закрыты на проде | 🟢 |
| 2026-08-25 | health CF / onpage | CF без прокси = P0 | P1 owner_action при живом origin | ложная авария | 🟢 |

---

*Обновлять после каждого прогона агента: `python3 real-besedki-seo-agent/main.py report`*

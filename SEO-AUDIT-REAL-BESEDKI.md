# SEO-аудит — real-besedki.ru

**Сайт:** https://real-besedki.ru/  
**Бренд:** REAL БЕСЕДКИ · ООО «Пулман»  
**Полное ТЗ:** `real-besedki-seo-agent/TZ-FULL.md`  
**90 дней:** `real-besedki-seo-agent/SEO-90-DAYS.md`  
**Последнее обновление:** 2026-10-19 06:55 UTC  
**Режим:** этап 2 — **автономные правки**

---

## Сводка прогона 2026-10-19

| Метрика | Значение |
|---------|----------|
| Ключевые маршруты | 7/7 OK (weekday) |
| Health после деплоя | **P0=0 · P1=1 · P2=2**: нет og:image у выборки ochagi/drovniki; og:type website+product; 800 городов |
| IndexNow | `/indexnow.txt` **200**, пинг api.indexnow.org + yandex.com **202** (19 URL) |
| SSL | Let's Encrypt YR2 до **2027-01-17** (89 дн.), SAN apex+www; `m.` убран из сертификата (NXDOMAIN) |
| seoDescription пилот | **3 карточки:** b-43, b-44, b-45 — живой meta, цены с сервера |
| Деплой Next.js | `deploy.sh` **OK**, post-deploy HEALTHY. Metadata API не принимает `og:type=product`; на карточке hoisted meta product + website |
| Органика / индекс / заявки | Недостаточно данных (нет Вебмастера / GSC / Метрики) |
| PageSpeed | Недостаточно данных (PSI HTTP 429, нет API-ключа) |

---

## Журнал проблем

| Приоритет | Проблема | URL / объект | Что исправлено | Статус |
|-----------|----------|--------------|----------------|--------|
| P0 | Сайт, SSL, форма, tel, хабы | прод | 19.10: P0=0, аварийного режима нет | 🟢 |
| P1 | Код сайта и SSH не в среде агента | `besedki-seo/`, `~/.ssh/besedki_deploy` | 19.10: секрет `BESEDKI_DEPLOY_SSH_KEY` → ключ; код снят с VPS `/var/www/besedki`. В git агента сайт не кладём | 🟢 |
| P1 | Нет og:image у части SKU | `/katalog/ochagi/oc-03`, `/katalog/drovniki/dr-03` | health 19.10 после деплоя (случайная выборка). У b-43 фото есть. Fallback на hero — в исходнике, в этом билде ещё нет | 🟡 |
| P2 | Карточки: `og:type=website`, не `product` | `/katalog/...` | Next 14 Metadata API падает на `product`. После деплоя на b-43 в HTML есть и `product` (extra meta), и `website` | 🟡 |
| P2 | ~800 городских шаблонов блога в sitemap | `/blog/klimat-nagruzki-*` и др. | не вынимались без решения по гео | 🟡 |
| P2 | IndexNow | `/indexnow.txt` | 19.10: ключ в `public/`, HTTPS 200, ping 202 на хабы + b-43/44/45 | 🟢 |
| P2 | SSL | сертификат | 19.10: продлён до 2027-01-17 без `m.real-besedki.ru` (DNS NXDOMAIN блокировал renew) | 🟢 |
| P1 | Cloudflare proxy | DNS | NS Beget, A `31.128.44.47`, cf-* нет. Пункт снят | 🟢 |
| P1 | Нет товарного og:image | карточки | на проде og:image есть | 🟢 |
| P1 | 54 ссылки на `/proekty` в блоге | блог | `/proekty` → 301 `/katalog` | 🟢 |
| P1 | Title карточек не уникальны | каталог | модель + размер + цена «от» | 🟢 |
| P1 | Сниппет про ДПК vs фанера | главная | пол из влагостойкой фанеры, каркас 80×80 | 🟢 |
| P1 | Нет данных Вебмастера / GSC / Метрики | кабинеты | Недостаточно данных | ⚪ |
| P1 | Яндекс Бизнес / Google Business | off-page | — | ⚪ |
| P1 | Метрика: цели форма + телефон | metrika | счётчик на проде отмечался ранее (`111500128`); целей нет в выгрузке | ⚪ |
| P2 | H1 категорий блога — slug | `/blog/category/sravneniya` | человекочитаемые H1 | 🟢 |
| P2 | BreadcrumbList | `/katalog` | CollectionPage + BreadcrumbList на хабе | 🟢 |
| P2 | ContactPage | `/kontakty` | JSON-LD ContactPage на проде | 🟢 |
| P2 | Поле `seoDescription` | каталог | пилот 3 карточки 19.10 (b-43, b-44, b-45). Осталось ~138 без сниппета | 🟡 |
| P2 | www/http/слеш | домен | http/www → 301 `https://real-besedki.ru/` | 🟢 |
| P3 | ТОП-20 карточек без уникального текста 800–1500 зн. | карточки | — | 🔴 |
| P3 | Нет раздела «Наши работы» с кейсами | новый раздел | — | 🔴 |
| P3 | Нет полноценного раздела отзывов | новый раздел | — | 🔴 |

**Легенда:** 🔴 Не исправлено · 🟡 В работе · 🟢 Исправлено / снято · ⚪ Требуется решение владельца

---

## Что уже OK (2026-10-19)

| Проверка | Статус |
|----------|--------|
| Главная, каталог, блог, контакты, услуги, материалы, о компании | 🟢 200 |
| Форма заявки + `tel:+74952555477` (iPhone UA) | 🟢 |
| robots.txt, sitemap ~2201 URL | 🟢 |
| IndexNow `/indexnow.txt` | 🟢 200 |
| SSL до 2027-01-17 | 🟢 |
| Title главной: металлические беседки под ключ в Москве | 🟢 |
| Description: фанера, каркас 80×80, Москва и МО | 🟢 |
| ContactPage, H1 категорий блога, BreadcrumbList на `/katalog` | 🟢 |
| Пилот seoDescription b-43 / b-44 / b-45 | 🟢 live meta |

---

## Последний прогон (2026-10-19)

- `bash scripts/seo-weekday.sh` — health+check+report+backlog. Понедельник: PageSpeed **429**, метрик нет.
- `bash scripts/seo-daily-ship.sh` — заполнены **b-43, b-44, b-45** через `fill-seo-descriptions.mjs` + `push:katalog --slugs` (цены с сервера, 193→193). Первый черновик ложно писал «остекление» из фразы «Без остекления» — детектор поправлен, сниппеты перезалиты: каркас 80×80, панели ЧПУ, пол фанера.
- IndexNow: ключ `public/indexnow.txt`, PM2 restart, HTTPS 200. Пинг 19 URL → 202.
- SSL: `certbot certonly` без `m.real-besedki.ru` → 2027-01-17.
- `cd besedki-seo && bash scripts/deploy.sh` — **HEALTHY**. CatalogCard `priority` для LCP. Extra `<meta property="og:type" content="product">` на карточках (рядом с website из Metadata API).
- `priceFrom` и целый `katalog.json` не заливались.
- Логи: `real-besedki-seo-agent/logs/2026-10-19_{health,check,seo,backlog,ship}.md`

### IndexNow — отправленные URL (не 800 городов)

`/`, `/katalog`, восемь категорий, `/kupit-metallicheskuyu-besedku`, `/metallicheskaya-besedka`, `/besedka-iz-metalla`, `/besedki-moskva`, `/tseny-na-besedki`, `/besedka-s-mangalom-pod-klyuch`, плюс три карточки пилота.

---

## Очередь

### Владелец (без кабинета агент не сделает)

1. Выгрузки Вебмастер + GSC + Метрика (цели форма / телефон). Пока их нет — **Недостаточно данных**.
2. Яндекс Бизнес / Google Business.
3. DNS `m.real-besedki.ru`: либо A на origin, либо убрать `m.` из nginx `server_name` (сейчас сертификат без `m.`).
4. Убрать `*.bak*` из `/etc/nginx/sites-enabled/` (дубли server_name).

### On-page

5. `og:type=product`: нужен путь мимо Next 14 Metadata whitelist (сейчас JSON-LD Product).
6. Пилот `seoDescription` — следующие 1–3 карточки за прогон.
7. Не вынимать 800 городских URL из sitemap без решения по гео.

---

## История изменений

| Дата | Объект | Было | Стало | Причина | Статус |
|------|--------|------|-------|---------|--------|
| 2026-08-24 | ТЗ | краткий TZ.md | TZ-FULL.md + этот журнал | внедрение полного ТЗ | 🟢 |
| 2026-08-25 | агент `scan_repo` / catalog / viewport | ложные critical | sitemap-каталог, мобильный CTA | weekday врал без `besedki-seo/` | 🟢 |
| 2026-08-25 | health CF / onpage | CF без прокси = P0 | P1 owner_action + живой OG | ложная авария | 🟢 |
| 2026-10-18 | health OG / backlog / ship | P1 «нет og:image+product» | тип и картинка разделены; ship честно пропускает без кода | ложный P1 | 🟢 |
| 2026-10-19 | IndexNow, SSL, ship, health | indexnow 404, SSL 34 дн., 0 сниппетов | ключ 200 + ping 202; SSL до 2027-01-17; 3 seoDescription live; P2=2 | будничный прогон | 🟢 |

---

*Обновлять после каждого прогона агента: `python3 real-besedki-seo-agent/main.py report`*

# SEO-аудит — real-besedki.ru

**Сайт:** https://real-besedki.ru/  
**Бренд:** REAL БЕСЕДКИ · ООО «Пулман»  
**Полное ТЗ:** `real-besedki-seo-agent/TZ-FULL.md`  
**90 дней:** `real-besedki-seo-agent/SEO-90-DAYS.md`  
**Последнее обновление:** 2026-10-20 06:30 UTC  
**Режим:** этап 2 — **автономные правки**

---

## Сводка прогона 2026-10-20

| Метрика | Значение |
|---------|----------|
| Ключевые маршруты | 7/7 OK |
| Карточки (выборка) | 10/10 OK · hero 10/10 · GLB 10/10 |
| Sitemap (выборка) | 0/20 ошибок · 2201 URL на проде |
| Светофор клиента | открыть ✓ · товар ✓ · заявка ✓ · выдача техника ✓ |
| Health | **P0=0 · P1=0 · P2=2** (og:type=website; 800 городских URL) |
| IndexNow | `/indexnow.txt` 200; пинг api.indexnow.org + yandex.com **200** (21 URL) |
| SSL | Let's Encrypt YR2 до **2027-01-17** (88 дн.) |
| seoDescription пилот | **3 карточки:** b-49, b-50, b-56 — JSON на сервере, 193→193 |
| Деплой | `remote-deploy.sh` **OK** BUILD_ID=`JRmWBey63iJuOFFRkTrmt`. Live: сниппеты b-49/50/56, посадочные на живые хабы |
| Органика / индекс / заявки | Недостаточно данных (нет Вебмастера / GSC / Метрики) |
| PageSpeed | не запускался (не понедельник) |

---

## Журнал проблем

| Приоритет | Проблема | URL / объект | Что исправлено | Статус |
|-----------|----------|--------------|----------------|--------|
| P0 | Сайт, SSL, форма, tel, хабы | прод | 20.10: P0=0, аварийного режима нет | 🟢 |
| P1 | Health брал черновики ochagi/drovniki | `/katalog/ochagi/oc-02` | категории unpublished 301 на `/katalog`; выборка catalog.py их больше не берёт | 🟢 |
| P1 | weekday падал на `._*` AppleDouble | `scan_repo` | skip `._*` + UnicodeDecodeError | 🟢 |
| P1 | Код сайта и SSH | `besedki-seo/`, ключ | секрет `BESEDKI_DEPLOY_SSH_KEY`; код с VPS, в git агента сайт не кладём | 🟢 |
| P2 | Карточки: `og:type=website`, не `product` | `/katalog/...` | Next 14 Metadata API не принимает `product`; JSON-LD Product есть | 🟡 |
| P2 | ~800 городских шаблонов блога в sitemap | `/blog/klimat-nagruzki-*` и др. | не вынимались без решения по гео | 🟡 |
| P2 | IndexNow | `/indexnow.txt` | 20.10: ping 200 на хабы + b-49/50/56 | 🟢 |
| P2 | SSL | сертификат | до 2027-01-17, SAN apex+www | 🟢 |
| P1 | Cloudflare proxy | DNS | NS Beget, A `31.128.44.47` — пункт снят | 🟢 |
| P1 | Нет товарного og:image | опубликованные карточки | на проде og:image есть | 🟢 |
| P1 | 54 ссылки на `/proekty` в блоге | блог | `/proekty` → 301 `/katalog` | 🟢 |
| P1 | Title карточек не уникальны | каталог | модель + размер + цена «от» | 🟢 |
| P1 | Сниппет про ДПК vs фанера | главная | пол из влагостойкой фанеры, каркас 80×80 | 🟢 |
| P1 | Нет данных Вебмастера / GSC / Метрики | кабинеты | Недостаточно данных | ⚪ |
| P1 | Яндекс Бизнес / Google Business | off-page | — | ⚪ |
| P1 | Метрика: цели форма + телефон | metrika | счётчик отмечался ранее (`111500128`); целей нет в выгрузке | ⚪ |
| P2 | H1 категорий блога — slug | `/blog/category/*` | человекочитаемые H1 | 🟢 |
| P2 | BreadcrumbList | `/katalog` | CollectionPage + BreadcrumbList | 🟢 |
| P2 | ContactPage | `/kontakty` | JSON-LD ContactPage | 🟢 |
| P2 | Поле `seoDescription` | каталог | пилот 20.10: b-49, b-50, b-56. Ранее b-43/44/45. Осталось ~106 без сниппета | 🟡 |
| P2 | www/http/слеш | домен | http/www → 301 `https://real-besedki.ru/` | 🟢 |
| P2 | Посадочные `/ochag-loft`, `/drovnik-loft` | ссылки на 301 | href на `/katalog/mangaly` и `/katalog/besedki-s-mangalom` | 🟡 |
| P3 | ТОП-20 карточек без уникального текста 800–1500 зн. | карточки | — | 🔴 |
| P3 | Нет раздела «Наши работы» с кейсами | новый раздел | — | 🔴 |
| P3 | Нет полноценного раздела отзывов | новый раздел | — | 🔴 |

**Легенда:** 🔴 Не исправлено · 🟡 В работе · 🟢 Исправлено / снято · ⚪ Требуется решение владельца

---

## Что уже OK (2026-10-20)

| Проверка | Статус |
|----------|--------|
| Главная, каталог, блог, контакты, услуги, материалы, о компании | 🟢 200 |
| Форма заявки + `tel:+74952555477` (iPhone UA) | 🟢 |
| robots.txt, sitemap 2201 URL | 🟢 |
| IndexNow `/indexnow.txt` | 🟢 200 |
| SSL до 2027-01-17 | 🟢 |
| Title главной: металлические беседки под ключ в Москве | 🟢 |
| Description: фанера, каркас 80×80, Москва и МО | 🟢 |
| ContactPage, H1 категорий блога, BreadcrumbList на `/katalog` | 🟢 |
| Пилот seoDescription b-43…b-45 и b-49 / b-50 / b-56 | 🟢 в katalog.json |

---

## Последний прогон (2026-10-20)

- `bash scripts/seo-weekday.sh` — первый заход упал на `._layout.tsx` (AppleDouble). После фикса `scan_repo`: health **P0=0 · P1=0 · P2=2**, check 7/7, карточки 10/10, report+backlog записаны.
- Ложный P1 «нет og:image у oc-02»: `ochagi`/`drovniki` — черновики, 301 на `/katalog`. `catalog.py` больше не сэмплит unpublished.
- `bash scripts/seo-daily-ship.sh` — **b-49, b-50, b-56** через `fill-seo-descriptions.mjs` + `push:katalog --slugs` (цены с сервера, 193→193). Fill пропускает unpublished.
- IndexNow: 21 URL → 200 (IndexNow + Яндекс).
- Сайт: `CatalogCard` optional `priority` (сборка хаба), ссылки посадочных с 301-категорий на живые хабы, fallback `og:image` в исходнике карточки.
- `priceFrom` и целый `katalog.json` не заливались.
- Логи: `real-besedki-seo-agent/logs/2026-10-20_{health,check,seo,backlog,ship}.md`

### IndexNow — отправленные URL (не 800 городов)

`/`, `/katalog`, восемь категорий, коммерческие хабы, плюс `/katalog/otkrytye-besedki/b-49|b-50|b-56`, `/ochag-loft`, `/drovnik-loft`.

---

## Очередь

### Владелец (без кабинета агент не сделает)

1. Выгрузки Вебмастер + GSC + Метрика (цели форма / телефон). Пока их нет — **Недостаточно данных**.
2. Яндекс Бизнес / Google Business.
3. DNS `m.real-besedki.ru`: либо A на origin, либо убрать `m.` из nginx `server_name`.

### On-page

4. `og:type=product`: нужен путь мимо Next 14 Metadata whitelist (сейчас JSON-LD Product).
5. Пилот `seoDescription` — следующие 1–3 карточки за прогон (~106 без сниппета).
6. Не вынимать 800 городских URL из sitemap без решения по гео.

---

## История изменений

| Дата | Объект | Было | Стало | Причина | Статус |
|------|--------|------|-------|---------|--------|
| 2026-08-24 | ТЗ | краткий TZ.md | TZ-FULL.md + этот журнал | внедрение полного ТЗ | 🟢 |
| 2026-08-25 | агент `scan_repo` / catalog / viewport | ложные critical | sitemap-каталог, мобильный CTA | weekday врал без `besedki-seo/` | 🟢 |
| 2026-08-25 | health CF / onpage | CF без прокси = P0 | P1 owner_action + живой OG | ложная авария | 🟢 |
| 2026-10-18 | health OG / backlog / ship | P1 «нет og:image+product» | тип и картинка разделены | ложный P1 | 🟢 |
| 2026-10-19 | IndexNow, SSL, ship, health | indexnow 404, SSL 34 дн. | ключ 200; SSL до 2027-01-17; 3 сниппета | будничный прогон | 🟢 |
| 2026-10-20 | catalog/health, ship, посадочные | P1 на 301-черновиках; weekday UnicodeDecode | unpublished skip; b-49/50/56; CatalogCard priority | будничный прогон | 🟢 |

---

*Обновлять после каждого прогона агента: `python3 real-besedki-seo-agent/main.py report`*

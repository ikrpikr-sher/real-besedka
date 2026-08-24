# SEO — технический чеклист

Сайт: https://real-besedki.ru  
Дата: 2026-08-15  
Режим: только чтение. Код и прод не менялись.

Источник: crawl sitemap 147 URL + точечные GET + nginx/Next на проде.  
Индекс / позиции / CWV кабинетов: недостаточно данных.

## Сводка

| | |
|---|---|
| sitemap | 147 URL, 200 |
| robots | 200, Sitemap указан |
| Title главной | Дизайнерские беседки из металла под ключ — Москва и МО \| ООО «Пулман» |
| Description главной | 140 знаков, каркас 80×80, ДПК, расчёт |
| H1 главной | Дизайнерские и лофт-беседки из металла под ключ |
| Критических к правке | теги в sitemap; хабы размера вне карты; пустые павильоны; нет OG на главной/карточках; 404 вместо 301 на опечатке |
| Этот репозиторий | не выкатывать (`/product/osteklenie-*` ≠ живой `/katalog`) |

## Сделано 15.08.2026 (после «исправь все что нужно»)

На живом `/var/www/besedki`, сборка Next, PM2 `besedki`. Этот репозиторий не выкатывался.

Проверено: sitemap 116, тегов 0, razmer 11, pavilony 0; robots с page/color/tag; B-17 OG+desc 88 зн.; k-01 H1 с размером; 404 title «Страница не найдена»; metalicheskaya 308.

## Было P0 — закрыто

1. `/blog/tag/*` (36) — вывести из sitemap, `noindex`. Title/H1 показывают percent-encoding, в slug есть пробелы, robots meta нет.
2. `/katalog/razmer/*` — вписать в sitemap (страницы 200, в карте 0).
3. `/katalog/pavilony` — noindex, убрать из sitemap (пустой каталог, 200).
4. Вернуть 301/308 `metalicheskaya` → `/uslugi/besedki-pod-klyuch`.
5. Open Graph: главная, категории, карточки (`og:image` с фото товара). Сейчас полный OG у 1 из 111 URL.

## Не трогать

HTTPS и www 301, robots Allow, canonical на коммерции, lang=ru, один H1, глубина ≤3, внутренние ссылки 20+, SSR-HTML, JSON-LD LocalBusiness/Product, alt у товарных фото (пустой alt — пиксель Метрики).

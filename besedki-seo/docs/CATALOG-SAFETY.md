# Безопасность каталога real-besedki.ru

Прод — источник правды для `data/katalog.json`. Локальная копия не коммитится.

## Запрещено

- `scp` / rsync **целого** `katalog.json` на сервер
- Менять **priceFrom** на проде без явной команды владельца
- Массово переписывать title / H1 / description всех карточек одним прогоном

## Разрешено

- Админка на проде (`/admin/catalog/katalog`)
- `npm run sync:katalog` — скачать каталог с сервера
- `npm run push:katalog -- --slugs a,b,c` — merge только указанных slug, цены с сервера
- Пилот `seoDescription`: максимум **3** карточки за прогон через `scripts/seo-daily-ship.sh`

## Поле seoDescription

- До 250 символов, без цены
- Пустые карточки заполняет `besedki-seo/scripts/ship-seo-descriptions.mjs`
- Не публиковать черновики: `pergoly`, `hozbloki`, `drovniki`, `bytovki`, `mebel`, `ochagi`

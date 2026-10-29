# Безопасность каталога

Прод: https://real-besedki.ru/ · файл на сервере: `/var/www/besedki/data/katalog.json`

## Запрещено

- Заливать **целый** `katalog.json` (`scp`, rsync без exclude, `deploy.sh` его и так не трогает).
- Менять **priceFrom** на проде без явной команды владельца.
- Массово переписывать title / H1 / description всех карточек одним прогоном.

## Разрешено

- Админка `/admin/catalog/katalog` — одна карточка.
- `bash scripts/sync-katalog-from-server.sh` — скачать прод к себе.
- `bash scripts/sync-katalog-to-server.sh --slugs b-10,b-12` — merge по slug, цены с сервера.
- Пилот `seoDescription`: максимум **3** карточки за прогон (`scripts/seo-daily-ship.sh`, API `limit ≤ 3`).

`data/katalog.json` в git не коммитить.

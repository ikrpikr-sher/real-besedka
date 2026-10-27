# Безопасность каталога real-besedki.ru

Прод: `https://real-besedki.ru/` · файл на сервере: `/var/www/besedki/data/katalog.json`  
Источник правды по ценам и составу карточек — **сервер**, не git.

## Нельзя

- Заливать **целый** `katalog.json` на прод (`scp`, `rsync` без exclude, ручная замена файла)
- Менять **priceFrom** на проде без явной команды владельца
- Коммитить целый `katalog.json` в git
- Массово переписывать title / H1 / description всех карточек одним прогоном

`besedki-seo/.rsync-exclude` обязан содержать `data/katalog.json`. `scripts/deploy.sh` сверяет md5 до и после rsync.

## Можно

- Админка `/admin/catalog/katalog` — одна карточка
- `bash scripts/sync-katalog-from-server.sh` — скачать прод (локальная копия, не в git)
- `bash scripts/sync-katalog-to-server.sh --slugs a,b,c` — merge по slug, **цены остаются с сервера**
- Пилот `seoDescription`: максимум **3 карточки за прогон** через `scripts/seo-daily-ship.sh`

## Перед любой выгрузкой slug

1. Скачать серверный файл
2. Merge только указанных slug
3. Не передавать `--take-local-prices`
4. Бэкап на сервере (`data/backups/katalog.json.before-merge.*`)
5. Не уменьшать число позиций

## Поля

| Поле | Кто трогает |
|------|-------------|
| `priceFrom` | только владелец / админка |
| `images`, `model3d` | админка / отдельные sync-скрипты |
| `seoDescription` | пилот ship, админка, не массово |
| `title`, `size`, `material` | админка |

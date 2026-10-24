# Каталог — правила безопасности

Прод `data/katalog.json` — источник правды. Админка пишет на сервер.

## Нельзя

- `scp` / `rsync` **целого** `katalog.json` на прод
- Менять `priceFrom` на проде
- Коммитить `katalog.json` в git

## Можно

- Скачать с прода: `bash scripts/sync-katalog-from-server.sh`
- Обновить **указанные** slug: `npm run push:katalog -- --slugs b-40,b-55`
- Пилот SEO: `node scripts/fill-seo-descriptions.mjs --limit 3` → push только этих slug
- Ежедневный путь: `bash scripts/seo-daily-ship.sh` (лимит 3)

`.rsync-exclude` и `deploy.sh` сверяют md5 каталога до и после синка. Если хеш сменился — деплой падает.

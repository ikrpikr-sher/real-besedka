# Схема: сайт всегда открывается (Cloudflare + origin)

Сайт: **https://real-besedki.ru/** · origin VPS `31.128.44.47` · зона CF `bc0aff2643c5fd39212533381ae0cb1e`

Посетитель никогда не ходит на IP VPS напрямую. Публичный A — anycast Cloudflare. Origin отдаёт HTML/фото только краю.

## Обязательно включено

| Слой | Значение | Зачем |
|---|---|---|
| DNS A `@`, `www`, `m` | Proxied (оранжевое облако) → `31.128.44.47` | Обход LTE `ERR_CONNECTION_RESET` до VPS (24.08) |
| Mail `autoconfig` / `autodiscover` | DNS only → Beget | Почта не через прокси |
| SSL CF | **Full (strict)** | Origin с Let's Encrypt |
| Always HTTPS | On | http → https на краю |
| HTTP/3 | **Off** | Safari зависал на `alt-svc: h3` |
| IPv6 Compatibility | **Off** | Часть LTE не коннектится к AAAA CF |
| Rocket Loader | Off | Ломает Next.js |
| Email obfuscation | Off | Подмешивает `email-decode.js` |
| Bot Fight / Under Attack | Off | Челленджи режут Safari / Android / WebView |
| Security level | Essentially Off | То же |
| Browser Integrity Check | Off | То же |
| 0-RTT | Off | Лишние сюрпризы TLS |
| Minify / Mirage / Polish | Off | Не трогать HTML/картинки |
| Hotlink Protection (CF) | Off | Режет Google/Яндекс/Android WebView |

## Origin nginx — нельзя

- `valid_referers` + `return 403` на `/images/`, `/videos/`, `/avito/images/`
- Отдавать `location = /` из `snapshot-home.html`
- Вставлять через `sub_filter` `pavilion-vent.js` / `home-workshop-video.js`

Эталон: `deploy/nginx-real-besedki.ru.conf`. Проверка: `bash scripts/verify-prod-health.sh`.

## Защита, которая не валит сайт

- Заголовки HSTS / nosniff / SAMEORIGIN на HTML
- `no-store` на `/admin`
- `limit_req` на `/api/admin/login` и `/internal-ops/`
- `photo-protect.js` (не копирайт-лок по Referer)
- `$media_cc`: 403/404 медиа не кэшируются
- CF Real IP: `deploy/nginx-cloudflare.conf`
- Always Online на краю — запасной HTML, если origin кратко недоступен

Не закрывать 443 только под IP Cloudflare без отдельного «да»: иначе нельзя быстро снять облако в аварии.

## Токен API

`CF_API_TOKEN` + `CF_ZONE_ID` только в `besedki-seo/.env.local` (не в git).

Применить схему: `bash scripts/cloudflare-apply-scheme.sh`  
Снимок: `bash scripts/cloudflare-audit.sh`

## После любой правки края или nginx

```bash
# purge — внутри cloudflare-apply-scheme.sh
bash scripts/verify-prod-health.sh
```

Проверка с телефона: LTE, без Wi‑Fi, Safari и Chrome — `/` и `/katalog`, фото в карточках.

# Срочно: Cloudflare для real-besedki.ru (обрывы с мобильных)

Актуальная схема (не ломать): [CLOUDFLARE-SCHEME.md](./CLOUDFLARE-SCHEME.md). Применить: `bash scripts/cloudflare-apply-scheme.sh`.

Сайт на VPS Beget **31.128.44.47** (СПб). Часть операторов в Москве/МО обрывает маршрут (`ERR_CONNECTION_RESET`).
Конкуренты на общем хостинге Beget (**185.x.x.x**) открываются — это другой IP.

**Решение:** пропустить трафик через Cloudflare (бесплатно, ~15 минут).

## 1. Cloudflare

1. https://dash.cloudflare.com → **Add a site** → `real-besedki.ru`
2. Тариф **Free**
3. NS-сервера для `real-besedki.ru` (уже выданы 24.08.2026):
   - `lola.ns.cloudflare.com`
   - `moura.ns.cloudflare.com`

## 2. Beget (cp.beget.com)

1. **Домены** → `real-besedki.ru` → **DNS / NS-серверы**
2. Сменить NS на те, что дал Cloudflare (не A-запись — именно NS)
3. Подождать 15–60 минут (иногда до 24 ч)

## 3. DNS в Cloudflare (уже настроено)

Сканирование Beget импортировало записи; A `@` и `www` → `31.128.44.47`, прокси **вкл**.

## 4. DNS в Cloudflare (справка)

| Тип | Имя | Значение | Прокси |
|-----|-----|----------|--------|
| A | `@` | `31.128.44.47` | **Вкл** (оранжевое облако) |
| A | `www` | `31.128.44.47` | **Вкл** |

## 5. SSL в Cloudflare (уже: Full strict)

**SSL/TLS** → **Overview** → режим **Full (strict)** — включено 24.08.2026.

(На сервере уже есть Let's Encrypt — готово.)

## 6. IPv6 — отключить (важно для LTE)

У домена есть AAAA-записи Cloudflare (`2606:4700:…`). На части сетей (в т.ч. мобильный LTE) IPv6 до Cloudflare **не коннектится** — браузер зависает или пишет «не удаётся открыть».

**Сделать в Cloudflare:**

1. https://dash.cloudflare.com → домен `real-besedki.ru`
2. **Network** → **IPv6 Compatibility** → **Off**
3. Подождать 5–10 минут, на телефоне включить/выключить авиарежим

Если переключателя нет (тариф Free) — через API (токен с правом Zone Settings):

```bash
curl -X PATCH "https://api.cloudflare.com/client/v4/zones/ZONE_ID/settings/ipv6" \
  -H "Authorization: Bearer CF_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"value":"off"}'
```

После отключения AAAA-записи исчезнут, телефоны пойдут только по IPv4.

## 7. Проверка

С телефона (Wi‑Fi выкл, только LTE): https://real-besedki.ru/ok.html

Должно показать короткую страницу «OK». Если главная не грузится, а ok.html открывается — проблема в тяжёлой странице/кэше, не в сети.

---

Если NS менять нельзя — напишите в поддержку Beget:
«С мобильных сетей Москвы/МО не открывается VPS 31.128.44.47, ERR_CONNECTION_RESET. Проверьте маршрутизацию или предложите IP/регион ближе к Москве.»

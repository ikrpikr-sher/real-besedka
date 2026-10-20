#!/usr/bin/env bash
# Отключить IPv6 Compatibility в Cloudflare (убирает AAAA → LTE перестаёт висеть).
# Нужны: CF_API_TOKEN (или CF_API_KEY + CF_EMAIL) и CF_ZONE_ID.
set -euo pipefail

ZONE_ID="${CF_ZONE_ID:-bc0aff2643c5fd39212533381ae0cb1e}"
TOKEN="${CF_API_TOKEN:-}"

if [[ -z "$ZONE_ID" || -z "$TOKEN" ]]; then
  echo "Задайте переменные:"
  echo "  export CF_ZONE_ID=...   # Overview → Zone ID справа"
  echo "  export CF_API_TOKEN=... # My Profile → API Tokens → Zone Settings Edit"
  echo "Затем: bash scripts/disable-cloudflare-ipv6.sh"
  exit 1
fi

curl -fsS -X PATCH "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/settings/ipv6" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  --data '{"value":"off"}' | python3 -m json.tool

echo "Готово. Подождите 5–10 мин, на телефоне авиарежим 30 сек, проверьте https://real-besedki.ru/ok.html"

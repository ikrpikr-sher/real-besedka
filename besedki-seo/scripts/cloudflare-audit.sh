#!/usr/bin/env bash
# Снимок настроек Cloudflare для real-besedki.ru (только чтение).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
if [[ -f "$ROOT/.env.local" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$ROOT/.env.local"
  set +a
fi
ZONE_ID="${CF_ZONE_ID:-bc0aff2643c5fd39212533381ae0cb1e}"
TOKEN="${CF_API_TOKEN:-}"
if [[ -z "$TOKEN" ]]; then
  echo "Нет CF_API_TOKEN в besedki-seo/.env.local"
  exit 1
fi

auth=( -H "Authorization: Bearer ${TOKEN}" -H "Content-Type: application/json" )

echo "=== token ==="
curl -fsS "https://api.cloudflare.com/client/v4/user/tokens/verify" "${auth[@]}" | python3 -c "import sys,json; d=json.load(sys.stdin); print('ok' if d.get('success') else d)"

echo "=== zone ==="
curl -fsS "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}" "${auth[@]}" | python3 -c "import sys,json; z=json.load(sys.stdin)['result']; print(z.get('name'), z.get('status'), z.get('plan',{}).get('name'))"

echo "=== settings ==="
for key in ssl http3 ipv6 websockets always_use_https always_online min_tls_version tls_1_3 browser_check security_level challenge_ttl rocket_loader email_obfuscation http2 0rtt; do
  curl -fsS "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/settings/${key}" "${auth[@]}" | python3 -c "import sys,json; d=json.load(sys.stdin); r=d.get('result') or {}; print('${key}:', r.get('value'), '(ok)' if d.get('success') else d.get('errors'))"
done

echo "=== bot_management ==="
curl -sS "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/bot_management" "${auth[@]}" | python3 -m json.tool | head -40

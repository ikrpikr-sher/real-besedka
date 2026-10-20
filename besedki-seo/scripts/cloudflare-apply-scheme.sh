#!/usr/bin/env bash
# Выравнивает Cloudflare real-besedki.ru по docs/CLOUDFLARE-SCHEME.md и чистит кэш.
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
API="https://api.cloudflare.com/client/v4/zones/${ZONE_ID}"

patch_setting() {
  local key="$1"
  local value="$2"
  local payload
  if [[ "$value" == \{* ]]; then
    payload="$value"
  else
    payload="$(printf '{"value":"%s"}' "$value")"
  fi
  local out
  out="$(curl -sS -X PATCH "${API}/settings/${key}" "${auth[@]}" --data "$payload")"
  python3 -c "import sys,json; d=json.load(sys.stdin); r=d.get('result') or {};
print('${key}:', r.get('value') if d.get('success') else d.get('errors'))" <<<"$out"
}

echo "=== zone settings (scheme) ==="
patch_setting ssl strict
patch_setting always_use_https on
patch_setting http3 off
patch_setting ipv6 off
patch_setting rocket_loader off
patch_setting email_obfuscation off
patch_setting security_level essentially_off
patch_setting browser_check off
patch_setting "0rtt" off
patch_setting always_online on
patch_setting websockets on
# http2 на Free нельзя менять через API (1015) — оставляем как есть (обычно on)
patch_setting min_tls_version "1.2"
patch_setting tls_1_3 on

# minify — объект
out="$(curl -sS -X PATCH "${API}/settings/minify" "${auth[@]}" --data '{"value":{"css":"off","html":"off","js":"off"}}')"
python3 -c "import sys,json; d=json.load(sys.stdin); print('minify:', (d.get('result') or {}).get('value') if d.get('success') else d.get('errors'))" <<<"$out"

for key in mirage polish hotlink_protection opportunistic_encryption; do
  out="$(curl -sS -X PATCH "${API}/settings/${key}" "${auth[@]}" --data '{"value":"off"}')"
  python3 -c "import sys,json; d=json.load(sys.stdin); r=d.get('result') or {};
print('${key}:', r.get('value') if d.get('success') else (d.get('errors') or [{'message':'skip'}])[0].get('message','err'))" <<<"$out" || echo "${key}: skip"
done

echo "=== DNS: A @/www/m must be proxied ==="
curl -fsS "${API}/dns_records?type=A&per_page=100" "${auth[@]}" | python3 -c '
import json, sys
d = json.load(sys.stdin)
need = {"real-besedki.ru", "www.real-besedki.ru", "m.real-besedki.ru"}
seen = set()
for rec in d.get("result") or []:
    name = rec.get("name") or ""
    if name not in need:
        continue
    seen.add(name)
    proxied = rec.get("proxied")
    content = rec.get("content")
    print(f"  {name} A {content} proxied={proxied}")
    if content != "31.128.44.47":
        print(f"  WARN: {name} origin is {content}, expected 31.128.44.47")
    if not proxied:
        print(f"  FAIL: {name} is DNS-only — LTE can RESET. Turn Proxied on in dashboard.")
        sys.exit(2)
missing = need - seen
if missing:
    print("  FAIL: missing A records:", ", ".join(sorted(missing)))
    sys.exit(2)
print("  ok: site A records proxied")
'

echo "=== DNS: mail must stay DNS-only ==="
curl -fsS "${API}/dns_records?per_page=200" "${auth[@]}" | python3 -c '
import json, sys
d = json.load(sys.stdin)
for rec in d.get("result") or []:
    name = rec.get("name") or ""
    if "autoconfig" in name or "autodiscover" in name:
        print("  %s %s proxied=%s" % (rec.get("type"), name, rec.get("proxied")))
        if rec.get("proxied"):
            print("  FAIL: mail hostname is proxied — turn DNS only")
            sys.exit(2)
print("  ok: mail records not proxied (or absent)")
'

echo "=== purge cache ==="
curl -fsS -X POST "${API}/purge_cache" "${auth[@]}" --data '{"purge_everything":true}' \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print('purge:', 'ok' if d.get('success') else d.get('errors'))"

echo "=== bot_management (read; token may 401) ==="
curl -sS "${API}/bot_management" "${auth[@]}" | python3 -c "import sys,json; d=json.load(sys.stdin);
print('bot_fight:', (d.get('result') or {}).get('fight_mode') if d.get('success') else d.get('errors'))"

echo "Scheme apply finished."

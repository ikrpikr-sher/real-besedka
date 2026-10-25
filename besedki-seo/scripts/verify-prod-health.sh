#!/usr/bin/env bash
# Проверка прода после деплоя и по cron: DNS, Next.js на главной, nginx без static-home, PM2.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
HOST="${DEPLOY_HOST:-root@31.128.44.47}"
KEY="${DEPLOY_SSH_KEY:-$HOME/.ssh/besedki_deploy}"
REMOTE="${DEPLOY_REMOTE:-/var/www/besedki}"
SSH="ssh -i $KEY -o IdentitiesOnly=yes -o ConnectTimeout=10"

DOMAIN="${VERIFY_DOMAIN:-real-besedki.ru}"
ORIGIN_IP="${VERIFY_ORIGIN_IP:-31.128.44.47}"
TECH_DOMAIN="${VERIFY_TECH_DOMAIN:-tuswudapastim.beget.app}"
UA_SAFARI="Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1"
UA_ANDROID="Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36"

errors=0
warnings=0
fail() { echo "FAIL: $1" >&2; errors=$((errors + 1)); }
warn() { echo "WARN: $1"; warnings=$((warnings + 1)); }
ok() { echo "  ok: $1"; }

echo "=== Production health: $DOMAIN ==="

resolved="$(dig +short A "$DOMAIN" 2>/dev/null | grep -E '^[0-9.]+$' | head -1 || true)"
if [[ -z "$resolved" ]]; then
  resolved="$(host -t A "$DOMAIN" 2>/dev/null | awk '/has address/ {print $4; exit}' || true)"
fi
if [[ -z "$resolved" ]]; then
  resolved="$(python3 -c "import socket; print(socket.gethostbyname('$DOMAIN'))" 2>/dev/null || true)"
fi
if [[ -z "$resolved" ]]; then
  fail "DNS: no A record for $DOMAIN"
elif [[ "$resolved" == "$ORIGIN_IP" ]]; then
  warn "DNS A is origin $ORIGIN_IP (no Cloudflare proxy) — LTE Moscow/MO can RESET. Owner: orange cloud, see docs/CLOUDFLARE-SCHEME.md"
else
  ok "DNS A $DOMAIN -> $resolved (not origin — proxy)"
fi

headers="$(curl -sI --max-time 20 "https://$DOMAIN/" 2>/dev/null || true)"
code="$(grep -m1 '^HTTP/' <<<"$headers" | awk '{print $2}' || echo "000")"
if [[ "$code" != "200" ]]; then
  fail "HTTPS / returned HTTP $code"
else
  ok "HTTPS / -> $code"
fi

if ! grep -qi 'cf-ray:' <<<"$headers"; then
  warn "no cf-ray on / — traffic is not going through Cloudflare (owner: Proxied A)"
else
  ok "cf-ray present (orange proxy)"
fi

if grep -qiE 'alt-svc:.*h3' <<<"$headers"; then
  fail "alt-svc advertises HTTP/3 — turn HTTP/3 Off in Cloudflare (Safari hang)"
else
  ok "no HTTP/3 alt-svc"
fi

if grep -qi 'x-served-by: static-home' <<<"$headers"; then
  fail "nginx serves static-home on / — mobile navigation will break"
else
  ok "no static-home header on /"
fi

body="$(curl -sf --max-time 25 "https://$DOMAIN/" 2>/dev/null | head -c 80000 || true)"
if [[ -z "$body" ]]; then
  fail "empty homepage body"
elif ! grep -qE '__NEXT_DATA__|/_next/static' <<<"$body"; then
  fail "homepage is not Next.js (check nginx proxy and PM2)"
else
  ok "homepage contains Next.js markers"
fi

gzip_hdr="$(curl -sI -H 'Accept-Encoding: gzip' --max-time 20 "https://$DOMAIN/" 2>/dev/null || true)"
if ! grep -qiE 'content-encoding:[[:space:]]*gzip' <<<"$gzip_hdr"; then
  fail "homepage HTML is not gzip — slow on mobile"
else
  ok "gzip Content-Encoding on /"
fi

if ! curl -sf --max-time 20 "https://$DOMAIN/katalog" >/dev/null 2>&1; then
  fail "/katalog not reachable"
else
  ok "/katalog -> 200"
fi

check_ad_redirect() {
  local src="$1" dest="$2"
  local hdr loc code
  hdr="$(curl -sI --max-time 15 "https://$DOMAIN$src" 2>/dev/null || true)"
  code="$(grep -m1 '^HTTP/' <<<"$hdr" | awk '{print $2}')"
  loc="$(grep -i '^location:' <<<"$hdr" | awk '{print $2}' | tr -d '\r')"
  if [[ "$code" != "301" && "$code" != "308" ]]; then
    fail "$src -> $code (expected 301 to $dest)"
  elif [[ "$loc" != *"$dest"* ]]; then
    fail "$src Location=$loc (expected $dest)"
  else
    ok "$src -> $code $dest"
  fi
}
check_ad_redirect /loft /besedka-loft
check_ad_redirect /panorama /besedka-panorama
check_ad_redirect /3x4 /besedka-3x4
check_ad_redirect /raschet /

ok_code="$(curl -sI --max-time 15 "https://$DOMAIN/ok.html" 2>/dev/null | grep -m1 '^HTTP/' | awk '{print $2}')"
if [[ "$ok_code" != "200" ]]; then
  fail "/ok.html -> $ok_code"
else
  ok "/ok.html -> 200"
fi

www_code="$(curl -sI --max-time 15 "https://www.$DOMAIN/" 2>/dev/null | grep -m1 '^HTTP/' | awk '{print $2}')"
if [[ "$www_code" != "301" && "$www_code" != "302" ]]; then
  fail "www HTTPS redirect -> $www_code (expected 301)"
else
  ok "www -> $www_code apex"
fi

img_google="$(curl -sI --max-time 20 -A "$UA_SAFARI" -e "https://www.google.com/" "https://$DOMAIN/images/hero-besedka.jpg" 2>/dev/null | grep -m1 '^HTTP/' | awk '{print $2}')"
img_android="$(curl -sI --max-time 20 -A "$UA_ANDROID" -e "android-app://com.yandex.searchapp/" "https://$DOMAIN/images/hero-besedka.jpg" 2>/dev/null | grep -m1 '^HTTP/' | awk '{print $2}')"
if [[ "$img_google" != "200" ]]; then
  fail "hero image with Google referer -> $img_google (valid_referers/hotlink?)"
else
  ok "hero image Google referer -> 200"
fi
if [[ "$img_android" != "200" ]]; then
  fail "hero image with android-app referer -> $img_android"
else
  ok "hero image android-app referer -> 200"
fi

safari_html="$(curl -sf --max-time 25 -A "$UA_SAFARI" -e "https://www.google.com/" "https://$DOMAIN/katalog" 2>/dev/null | head -c 120000 || true)"
if [[ -z "$safari_html" ]]; then
  fail "Safari UA /katalog empty"
elif grep -q 'email-decode.min.js' <<<"$safari_html"; then
  fail "Cloudflare email-decode.js in HTML — turn Email Obfuscation Off"
elif grep -q 'preload" as="image" href="https://mc.yandex.ru/watch/' <<<"$safari_html"; then
  fail "Metrika image preload in HTML — Safari can hang"
elif ! grep -qE '__NEXT_DATA__|/_next/static' <<<"$safari_html"; then
  fail "Safari UA /katalog is not Next.js"
else
  ok "Safari UA /katalog: Next.js, no email-decode, no Metrika image preload"
fi

if $SSH "$HOST" "grep -E '^[[:space:]]*valid_referers|^[[:space:]]*if \\(\\\$invalid_referer\\)' /etc/nginx/sites-enabled/real-besedki.ru" >/dev/null 2>&1; then
  fail "nginx has active referer lock on images — remove it (CF caches 403)"
else
  ok "nginx: no referer lock on images"
fi

if ! curl -sfI --max-time 20 "https://$DOMAIN/models/b-53.glb" | grep -q '200\|206'; then
  fail "sample GLB /models/b-53.glb not reachable"
else
  ok "sample GLB reachable"
fi

if curl -sf --max-time 15 "https://$TECH_DOMAIN/" >/dev/null 2>&1; then
  ok "tech domain $TECH_DOMAIN responds"
else
  fail "tech domain $TECH_DOMAIN down"
fi

if $SSH "$HOST" "grep -E '^[[:space:]]*location = /[[:space:]]*\\{' /etc/nginx/sites-enabled/real-besedki.ru" >/dev/null 2>&1; then
  fail "nginx has active exact location = / (static-home) — mobile navigation will break"
else
  ok "nginx: no exact location = / (Next.js serves /)"
fi

if $SSH "$HOST" "grep -E 'sub_filter .*home-workshop-video|sub_filter .*pavilion-vent' /etc/nginx/sites-enabled/real-besedki.ru" >/dev/null 2>&1; then
  fail "nginx injects workshop/vent JS — Safari on iPhone hangs (MutationObserver)"
else
  ok "nginx: no workshop/vent script inject"
fi

pm2_status="$($SSH "$HOST" "pm2 jlist 2>/dev/null" || echo '[]')"
if ! grep -q '"name":"besedki"' <<<"$pm2_status"; then
  fail "PM2 app besedki not found"
elif ! grep -q '"status":"online"' <<<"$pm2_status"; then
  fail "PM2 besedki not online"
else
  ok "PM2 besedki online"
fi

if $SSH "$HOST" "test -f $REMOTE/data/katalog.json"; then
  katalog_count="$($SSH "$HOST" "python3 -c \"import json; print(len(json.load(open('$REMOTE/data/katalog.json'))))\"")"
  ok "remote katalog.json: $katalog_count items"
else
  fail "remote katalog.json missing"
fi

echo ""
if [[ "$errors" -gt 0 ]]; then
  echo "UNHEALTHY: $errors check(s) failed"
  exit 1
fi

if [[ "$warnings" -gt 0 ]]; then
  echo "HEALTHY: production checks passed ($warnings owner warning(s) — Cloudflare / LTE)"
else
  echo "HEALTHY: production checks passed"
fi
exit 0

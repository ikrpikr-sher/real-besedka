#!/usr/bin/env bash
set -euo pipefail
# Включает proxy_cache для HTML на real-besedki.ru (без cache_lock — иначе телефоны «висят»).

CACHE_CONF="/etc/nginx/conf.d/besedki-proxy-cache.conf"
SITE="/etc/nginx/sites-enabled/real-besedki.ru"

if [[ ! -f "$SITE" ]]; then
  echo "ERROR: $SITE not found"
  exit 1
fi

cp "$(dirname "$0")/../deploy/nginx-proxy-cache.conf" "$CACHE_CONF"
mkdir -p /var/cache/nginx/besedki
chown -R www-data:www-data /var/cache/nginx/besedki 2>/dev/null || chown -R nginx:nginx /var/cache/nginx/besedki 2>/dev/null || true

python3 << 'PY'
from pathlib import Path
import re
p = Path("/etc/nginx/sites-enabled/real-besedki.ru")
text = p.read_text()
block = re.compile(
    r"\n    # besedki-proxy-cache\n    proxy_cache besedki_cache;\n    proxy_cache_valid 200 5m;\n    proxy_cache_use_stale updating error timeout http_500 http_502 http_503 http_504;\n    proxy_cache_lock[^\n]*\n    proxy_cache_key[^\n]*\n    add_header X-Cache-Status[^\n]*\n",
    re.M,
)
text = block.sub("\n", text)
old = """    location / {
        proxy_http_version 1.1;
        proxy_cache_bypass $http_upgrade;"""
new = """    location / {
        proxy_cache besedki_cache;
        proxy_cache_valid 200 5m;
        proxy_cache_use_stale updating error timeout http_500 http_502 http_503 http_504;
        proxy_cache_lock off;
        proxy_cache_key \"$scheme$host$request_uri\";
        add_header X-Cache-Status $upstream_cache_status always;
        proxy_connect_timeout 10s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        proxy_http_version 1.1;
        proxy_cache_bypass $http_upgrade;"""
if "proxy_cache_lock off" not in text:
    if old not in text:
        raise SystemExit("location / pattern not found")
    text = text.replace(old, new, 1)
p.write_text(text)
print("nginx site patched")
PY

nginx -t
systemctl reload nginx
echo "OK: nginx proxy cache (lock off)"

#!/usr/bin/env bash
set -euo pipefail
# Главная отдаётся как статический snapshot-home.html — работает даже если Next.js тормозит.
# ОПАСНО: ломает мобильную навигацию (нет JS Next.js). Не включать без явного решения.

if [[ "${CONFIRM_STATIC_HOME:-}" != "1" ]]; then
  echo "REFUSED: static-home breaks mobile navigation and client-side routing."
  echo "If you really need it: CONFIRM_STATIC_HOME=1 bash $0"
  exit 1
fi

SITE="/etc/nginx/sites-enabled/real-besedki.ru"
ROOT="/var/www/besedki"
SNAP="$ROOT/public/snapshot-home.html"

if [[ ! -f "$SITE" ]]; then
  echo "ERROR: $SITE not found"
  exit 1
fi

CSS=$(ls "$ROOT/.next/static/css/"*.css 2>/dev/null | head -1 || true)
if [[ -n "${CSS:-}" ]]; then
  curl -sf --max-time 30 http://127.0.0.1:3000/ \
    | python3 "$ROOT/scripts/build-snapshot-home.py" "$CSS" > "$SNAP"
else
  echo "WARN: CSS not found — snapshot without inlined CSS"
  curl -sf --max-time 30 http://127.0.0.1:3000/ > "$SNAP" || true
fi
wc -c "$SNAP"

python3 << 'PY'
from pathlib import Path
p = Path("/etc/nginx/sites-enabled/real-besedki.ru")
text = p.read_text()
if "snapshot-home.html" in text and "location = / {" in text and "@besedki_next" in text:
    print("already configured")
    raise SystemExit(0)

old = """    location / {
        proxy_no_cache 1;
        proxy_cache_bypass 1;
        proxy_hide_header ETag;
        add_header Cache-Control "no-store, no-cache, must-revalidate, max-age=0" always;
        add_header Pragma "no-cache" always;
        proxy_connect_timeout 10s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_pass http://127.0.0.1:3000;
    }"""

new = """    location = / {
        root /var/www/besedki/public;
        try_files /snapshot-home.html @besedki_next;
        add_header Cache-Control "public, max-age=60" always;
        add_header X-Served-By "static-home" always;
    }

    location @besedki_next {
        proxy_no_cache 1;
        proxy_cache_bypass 1;
        proxy_hide_header ETag;
        add_header Cache-Control "no-store, no-cache, must-revalidate, max-age=0" always;
        add_header Pragma "no-cache" always;
        proxy_connect_timeout 10s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_pass http://127.0.0.1:3000;
    }

    location / {
        proxy_no_cache 1;
        proxy_cache_bypass 1;
        proxy_hide_header ETag;
        add_header Cache-Control "no-store, no-cache, must-revalidate, max-age=0" always;
        add_header Pragma "no-cache" always;
        proxy_connect_timeout 10s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_pass http://127.0.0.1:3000;
    }"""

if old not in text:
    raise SystemExit("nginx pattern not found — patch manually")
p.write_text(text.replace(old, new, 1))
print("patched static home")
PY

nginx -t
systemctl reload nginx
echo "OK: static homepage via nginx"

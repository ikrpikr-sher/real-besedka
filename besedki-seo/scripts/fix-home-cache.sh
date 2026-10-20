#!/usr/bin/env bash
set -euo pipefail
SITE="/etc/nginx/sites-enabled/real-besedki.ru"

python3 << 'PY'
from pathlib import Path
p = Path("/etc/nginx/sites-enabled/real-besedki.ru")
text = p.read_text()
old = """    location = / {
        root /var/www/besedki/public;
        try_files /snapshot-home.html @besedki_next;
        add_header X-Served-By "static-home" always;
    }"""
new = """    location = / {
        root /var/www/besedki/public;
        try_files /snapshot-home.html @besedki_next;
        expires off;
        etag off;
        if_modified_since off;
        add_header Cache-Control "no-store, no-cache, must-revalidate, max-age=0" always;
        add_header Pragma "no-cache" always;
        add_header X-Served-By "static-home" always;
    }"""
if old in text:
    text = text.replace(old, new, 1)
    p.write_text(text)
    print("patched no-cache headers")
else:
    print("location = / already patched or missing")
PY

nginx -t && systemctl reload nginx
echo "OK"

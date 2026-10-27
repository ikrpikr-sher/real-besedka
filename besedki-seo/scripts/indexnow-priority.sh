#!/usr/bin/env bash
# IndexNow для приоритетных коммерческих URL (не всего блога).
# Ключ публичный: файл https://real-besedki.ru/<key>.txt должен уже отдавать ключ.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
KEY_FILE="$ROOT/indexnow.key"
if [[ ! -f "$KEY_FILE" ]]; then
  echo "ERROR: $KEY_FILE missing" >&2
  exit 1
fi
KEY="$(tr -d '[:space:]' < "$KEY_FILE")"
PUB="$ROOT/public/${KEY}.txt"
if [[ ! -f "$PUB" ]]; then
  echo "ERROR: $PUB missing" >&2
  exit 1
fi
HOST="real-besedki.ru"
KEY_URL="https://${HOST}/${KEY}.txt"

python3 - "$KEY" "$KEY_URL" << 'PY'
import json, sys, urllib.request
key, key_url = sys.argv[1], sys.argv[2]
paths = [
    "/",
    "/katalog",
    "/katalog/otkrytye-besedki",
    "/katalog/besedki-s-ostekleniem",
    "/katalog/besedki-osteklennye-loft",
    "/katalog/besedki-s-mangalom",
    "/katalog/navesy",
    "/katalog/mangaly",
    "/katalog/kacheli",
    "/katalog/pavilony",
    "/kupit-metallicheskuyu-besedku",
    "/tseny-na-besedki",
    "/besedka-3x3",
    "/besedka-3x4",
    "/besedka-4x3",
    "/besedka-4x4",
    "/besedka-loft",
    "/osteklennaya-besedka",
    "/zimnyaya-besedka",
    "/zakrytaya-besedka",
    "/otkrytaya-besedka",
    "/besedka-pod-klyuch",
    "/besedka-s-mangalom-pod-klyuch",
    "/dostavka-i-montazh",
    "/metallicheskiy-naves",
    "/mangalnaya-zona",
    "/besedki-moskva",
    "/proizvoditel-besedok",
    "/zakazat-besedku",
    "/kontakty",
    "/regiony",
]
body = {
    "host": "real-besedki.ru",
    "key": key,
    "keyLocation": key_url,
    "urlList": [f"https://real-besedki.ru{p}" for p in paths],
}
payload = json.dumps(body).encode()
# Confirm the key file is live before notifying engines.
try:
    with urllib.request.urlopen(key_url, timeout=20) as resp:
        live = resp.read().decode().strip()
        status = resp.status
except Exception as exc:
    print(json.dumps({"ok": False, "step": "key", "error": str(exc)}))
    sys.exit(1)
if status != 200 or live != key:
    print(json.dumps({"ok": False, "step": "key", "status": status, "match": live == key}))
    sys.exit(1)
results = []
for endpoint in ("https://yandex.com/indexnow", "https://api.indexnow.org/indexnow"):
    req = urllib.request.Request(
        endpoint,
        data=payload,
        headers={"Content-Type": "application/json; charset=utf-8"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            results.append({"endpoint": endpoint, "status": resp.status})
    except Exception as exc:
        code = getattr(exc, "code", None)
        results.append({"endpoint": endpoint, "status": code, "error": str(exc)})
ok = all(r.get("status") in (200, 202) for r in results)
print(json.dumps({"ok": ok, "urls": len(body["urlList"]), "results": results}, ensure_ascii=False))
sys.exit(0 if ok else 1)
PY

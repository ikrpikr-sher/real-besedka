#!/usr/bin/env bash
# Безопасно добавить/обновить карточки на сервере: merge по slug, бэкап на сервере, без полной перезаписи.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
HOST="${DEPLOY_HOST:-root@31.128.44.47}"
KEY="${DEPLOY_SSH_KEY:-$HOME/.ssh/besedki_deploy}"
REMOTE="${DEPLOY_REMOTE:-/var/www/besedki}"
SSH="ssh -i $KEY -o IdentitiesOnly=yes"
LOCAL="$ROOT/data/katalog.json"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

SLUGS=""
TAKE_LOCAL_PRICES=0

usage() {
  echo "Usage: $0 [--slugs b-18,b-19] [--take-local-prices]"
  echo ""
  echo "  1. Скачивает серверный katalog.json"
  echo "  2. Merge с локальным (upsert по slug, цены с сервера)"
  echo "  3. validate → бэкап на сервере → upload merged"
  echo ""
  echo "Без --slugs обновляются все slug, которые есть в локальном файле."
  echo "Полная замена каталога ЗАПРЕЩЕНА. Для нового товара — лучше админка на проде."
  exit 1
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --slugs) SLUGS="$2"; shift 2 ;;
    --take-local-prices) TAKE_LOCAL_PRICES=1; shift ;;
    -h|--help) usage ;;
    *) echo "Unknown: $1"; usage ;;
  esac
done

if [[ ! -f "$LOCAL" ]]; then
  echo "ERROR: local $LOCAL not found. Run sync-katalog-from-server.sh first or create cards in admin."
  exit 1
fi

echo "Fetching remote katalog.json..."
scp -i "$KEY" -o IdentitiesOnly=yes "$HOST:$REMOTE/data/katalog.json" "$TMP/remote.json"

MERGE_ARGS=(--base "$TMP/remote.json" --patch "$LOCAL" --out "$TMP/merged.json")
if [[ -n "$SLUGS" ]]; then
  MERGE_ARGS+=(--slugs "$SLUGS")
fi
if [[ "$TAKE_LOCAL_PRICES" -eq 1 ]]; then
  MERGE_ARGS+=(--take-local-prices)
fi

node "$ROOT/scripts/merge-katalog.mjs" "${MERGE_ARGS[@]}"

cp "$TMP/merged.json" "$TMP/validate.json"
node "$ROOT/scripts/validate-katalog.mjs" --skip-file-check "$TMP/validate.json"

remote_count="$(python3 -c "import json; print(len(json.load(open('$TMP/remote.json'))))")"
merged_count="$(python3 -c "import json; print(len(json.load(open('$TMP/merged.json'))))")"
if [[ "$merged_count" -lt "$remote_count" ]]; then
  echo "ERROR: merge would remove items ($remote_count → $merged_count). Aborted."
  exit 1
fi

stamp="$(date -u +%Y%m%dT%H%M%SZ)"
$SSH "$HOST" "mkdir -p $REMOTE/data/backups && cp $REMOTE/data/katalog.json $REMOTE/data/backups/katalog.json.before-merge.${stamp}.json"

scp -i "$KEY" -o IdentitiesOnly=yes "$TMP/merged.json" "$HOST:$REMOTE/data/katalog.json"

echo "Uploaded merged katalog.json ($remote_count → $merged_count items)."
echo "Server backup: data/backups/katalog.json.before-merge.${stamp}.json"
echo "Tip: bash scripts/sync-katalog-from-server.sh — чтобы локальная копия совпала с продом."

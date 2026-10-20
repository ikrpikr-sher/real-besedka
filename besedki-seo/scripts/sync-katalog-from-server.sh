#!/usr/bin/env bash
# Скачать katalog.json с сервера (источник правды). Локальная копия бэкапится.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
HOST="${DEPLOY_HOST:-root@31.128.44.47}"
KEY="${DEPLOY_SSH_KEY:-$HOME/.ssh/besedki_deploy}"
REMOTE="${DEPLOY_REMOTE:-/var/www/besedki}"
LOCAL="$ROOT/data/katalog.json"
BACKUP_DIR="$ROOT/data/backups"

mkdir -p "$BACKUP_DIR"

if [[ -f "$LOCAL" ]]; then
  stamp="$(date -u +%Y%m%dT%H%M%SZ)"
  cp "$LOCAL" "$BACKUP_DIR/katalog.json.before-pull.${stamp}.json"
  echo "Local backup: data/backups/katalog.json.before-pull.${stamp}.json"
fi

scp -i "$KEY" -o IdentitiesOnly=yes "$HOST:$REMOTE/data/katalog.json" "$LOCAL"
node "$ROOT/scripts/validate-katalog.mjs" --skip-file-check
echo "Synced katalog.json from server → local (prod is source of truth)."

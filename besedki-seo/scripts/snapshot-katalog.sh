#!/usr/bin/env bash
# Зафиксировать текущий katalog.json (после правок в админке) — бэкап с меткой времени.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
STAMP="$(date -u +%Y-%m-%dT%H%M%S)"
LOCAL="$ROOT/data/katalog.json"
BACKUP_DIR="$ROOT/data/backups"
SNAP="$BACKUP_DIR/katalog.json.snapshot.${STAMP}.json"

if [[ ! -f "$LOCAL" ]]; then
  echo "No local katalog.json. Run: npm run sync:katalog"
  exit 1
fi

mkdir -p "$BACKUP_DIR"
cp "$LOCAL" "$SNAP"
echo "Local snapshot: $SNAP"

HOST="${BESedKI_HOST:-root@31.128.44.47}"
KEY="${BESedKI_SSH_KEY:-$HOME/.ssh/besedki_deploy}"
REMOTE="${BESedKI_REMOTE:-/var/www/besedki}"

if ssh -i "$KEY" -o ConnectTimeout=8 -o BatchMode=yes "$HOST" "test -f $REMOTE/data/katalog.json" 2>/dev/null; then
  ssh -i "$KEY" "$HOST" "mkdir -p $REMOTE/data/backups && cp $REMOTE/data/katalog.json $REMOTE/data/backups/katalog.json.snapshot.${STAMP}.json"
  echo "Prod snapshot:  $REMOTE/data/backups/katalog.json.snapshot.${STAMP}.json"
else
  echo "WARN: prod unreachable — only local snapshot saved"
fi

echo "Done. Your admin changes are pinned at snapshot ${STAMP}"

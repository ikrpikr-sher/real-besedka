#!/usr/bin/env bash
# Явная выгрузка GLB на сервер (обычный deploy GLB не трогает — см. .rsync-exclude).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
HOST="${DEPLOY_HOST:-root@31.128.44.47}"
KEY="${DEPLOY_SSH_KEY:-$HOME/.ssh/besedki_deploy}"
REMOTE="${DEPLOY_REMOTE:-/var/www/besedki/public/models}"

echo "Syncing GLB to $HOST:$REMOTE ..."
rsync -az \
  -e "ssh -i $KEY -o IdentitiesOnly=yes" \
  "$ROOT/public/models/" "$HOST:$REMOTE/"

echo "Done."

#!/usr/bin/env bash
# Sync blog MDX + blog images to prod (excluded from main deploy rsync).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
HOST="${DEPLOY_HOST:-root@31.128.44.47}"
KEY="${DEPLOY_KEY:-$HOME/.ssh/besedki_deploy}"
REMOTE="${REMOTE_PATH:-/var/www/besedki}"
SSH=(ssh -i "$KEY" -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new)
RSYNC=(rsync -az --delete -e "ssh -i $KEY -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new")

echo "== blog MDX =="
"${RSYNC[@]}" "$ROOT/content/blog/" "$HOST:$REMOTE/content/blog/"

echo "== blog images (uniq + new) =="
# Direct paths — do NOT use --relative (on macOS it can "succeed" without
# syncing slug subfolders into public/images/blog/uniq/).
"${SSH[@]}" "$HOST" "mkdir -p $REMOTE/public/images/blog/uniq $REMOTE/public/images/blog/new"
"${RSYNC[@]}" "$ROOT/public/images/blog/uniq/" "$HOST:$REMOTE/public/images/blog/uniq/"
if [[ -d "$ROOT/public/images/blog/new" ]]; then
  "${RSYNC[@]}" "$ROOT/public/images/blog/new/" "$HOST:$REMOTE/public/images/blog/new/"
fi

echo "== restart =="
"${SSH[@]}" "$HOST" 'pm2 restart besedki'
echo "OK blog deploy"

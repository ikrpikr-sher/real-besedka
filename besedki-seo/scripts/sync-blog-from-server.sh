#!/usr/bin/env bash
# Скачать статьи блога и загруженные видео с сервера (источник правды для админки).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
HOST="${DEPLOY_HOST:-root@31.128.44.47}"
KEY="${DEPLOY_SSH_KEY:-$HOME/.ssh/besedki_deploy}"
REMOTE="${DEPLOY_REMOTE:-/var/www/besedki}"
BACKUP_DIR="$ROOT/content/backups"
RSYNC=(rsync -az -e "ssh -i $KEY -o IdentitiesOnly=yes")

mkdir -p "$BACKUP_DIR" "$ROOT/content/blog" "$ROOT/public/videos/blog" "$ROOT/public/images/blog"

if compgen -G "$ROOT/content/blog/*.mdx" > /dev/null; then
  stamp="$(date -u +%Y%m%dT%H%M%SZ)"
  tar -czf "$BACKUP_DIR/blog.before-pull.${stamp}.tar.gz" -C "$ROOT/content" blog
  echo "Local backup: content/backups/blog.before-pull.${stamp}.tar.gz"
fi

"${RSYNC[@]}" "$HOST:$REMOTE/content/blog/" "$ROOT/content/blog/"
"${RSYNC[@]}" "$HOST:$REMOTE/public/videos/" "$ROOT/public/videos/"
"${RSYNC[@]}" "$HOST:$REMOTE/public/images/blog/" "$ROOT/public/images/blog/"

count="$(find "$ROOT/content/blog" -maxdepth 1 -name '*.mdx' | wc -l | tr -d ' ')"
echo "Synced blog from server → local ($count posts, videos/blog, images/blog)."

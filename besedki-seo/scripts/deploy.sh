#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
HOST="${DEPLOY_HOST:-root@31.128.44.47}"
if [[ -n "${BESEDKI_DEPLOY_SSH_KEY:-}" && "$BESEDKI_DEPLOY_SSH_KEY" == *"BEGIN"* ]]; then
  KEY="$(mktemp)"
  printf '%s\n' "$BESEDKI_DEPLOY_SSH_KEY" > "$KEY"
  chmod 600 "$KEY"
  trap 'rm -f "$KEY"' EXIT
else
  KEY="${DEPLOY_SSH_KEY:-$HOME/.ssh/besedki_deploy}"
fi
mkdir -p "$HOME/.ssh"
if [[ ! -f "$HOME/.ssh/known_hosts" ]] || ! grep -q '31.128.44.47' "$HOME/.ssh/known_hosts"; then
  ssh-keyscan -T 10 -H 31.128.44.47 >> "$HOME/.ssh/known_hosts" 2>/dev/null || true
fi
REMOTE="${DEPLOY_REMOTE:-/var/www/besedki}"
SSH="ssh -i $KEY -o IdentitiesOnly=yes"

echo "Pre-deploy checks..."
bash "$ROOT/scripts/verify-deploy-guards.sh"
bash "$ROOT/scripts/verify-catalog-models.sh"
node "$ROOT/scripts/verify-katalog-order.mjs"

REMOTE_KATALOG_HASH="$($SSH "$HOST" "md5sum $REMOTE/data/katalog.json 2>/dev/null | awk '{print \$1}'" || true)"
if [[ -z "$REMOTE_KATALOG_HASH" ]]; then
  echo "WARN: could not read remote katalog.json hash (SSH?)"
fi

REMOTE_BLOG_HASH="$($SSH "$HOST" "find $REMOTE/content/blog -maxdepth 1 -name '*.mdx' -type f -print0 | sort -z | xargs -0 md5sum | md5sum | awk '{print \$1}'" || true)"
if [[ -z "$REMOTE_BLOG_HASH" ]]; then
  echo "WARN: could not read remote content/blog hash (SSH?)"
fi

echo "Syncing files (live .next on server is not touched)..."
rsync -az --checksum \
  --exclude-from="$ROOT/.rsync-exclude" \
  -e "ssh -i $KEY -o IdentitiesOnly=yes" \
  "$ROOT/" "$HOST:$REMOTE/"

if [[ -n "$REMOTE_KATALOG_HASH" ]]; then
  AFTER_HASH="$($SSH "$HOST" "md5sum $REMOTE/data/katalog.json 2>/dev/null | awk '{print \$1}'")"
  if [[ "$REMOTE_KATALOG_HASH" != "$AFTER_HASH" ]]; then
    echo "ERROR: data/katalog.json on server changed during deploy!"
    echo "  before: $REMOTE_KATALOG_HASH"
    echo "  after:  $AFTER_HASH"
    echo "Check .rsync-exclude — data/katalog.json must stay excluded."
    exit 1
  fi
  echo "  ok: remote katalog.json unchanged (md5 $AFTER_HASH)"
fi

if [[ -n "$REMOTE_BLOG_HASH" ]]; then
  AFTER_BLOG_HASH="$($SSH "$HOST" "find $REMOTE/content/blog -maxdepth 1 -name '*.mdx' -type f -print0 | sort -z | xargs -0 md5sum | md5sum | awk '{print \$1}'")"
  if [[ "$REMOTE_BLOG_HASH" != "$AFTER_BLOG_HASH" ]]; then
    echo "ERROR: content/blog on server changed during deploy!"
    echo "  before: $REMOTE_BLOG_HASH"
    echo "  after:  $AFTER_BLOG_HASH"
    echo "Check .rsync-exclude — content/blog/ must stay excluded."
    exit 1
  fi
  echo "  ok: remote content/blog unchanged (hash $AFTER_BLOG_HASH)"
fi

echo "Remote build + atomic swap + health check..."
if ! $SSH "$HOST" "bash $REMOTE/scripts/remote-deploy.sh $REMOTE"; then
  echo "ERROR: remote deploy failed."
  exit 1
fi

echo "Deploy complete. Leads file on server was not overwritten."
echo "Note: data/katalog.json on server is NOT replaced — catalog order/photos from admin are kept."
echo "Note: content/blog/ and public/videos/ on server are NOT replaced — blog posts and videos from admin are kept."
echo "Note: public/models/*.glb on server are NOT replaced — use npm run sync:models after export."

echo ""
echo "Post-deploy health check..."
if bash "$ROOT/scripts/verify-prod-health.sh"; then
  echo "Production health OK."
else
  echo "WARN: production health check failed — review DNS/nginx/PM2."
  exit 1
fi

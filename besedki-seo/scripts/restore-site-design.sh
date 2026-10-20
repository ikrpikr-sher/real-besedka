#!/usr/bin/env bash
# Restore a frozen homepage/catalog design snapshot. Does not touch katalog.json / prices.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SNAP_NAME="${1:-}"
SNAP_ROOT="$ROOT/legacy/site-design"

usage() {
  echo "Usage: bash scripts/restore-site-design.sh <snapshot>"
  echo "Snapshots:"
  ls -1 "$SNAP_ROOT" | grep -v README || true
  exit 1
}

[[ -n "$SNAP_NAME" ]] || usage
SRC="$SNAP_ROOT/$SNAP_NAME"
[[ -d "$SRC/app" ]] || { echo "Unknown snapshot: $SNAP_NAME"; usage; }

copy_if() {
  local rel="$1"
  if [[ -f "$SRC/$rel" ]]; then
    mkdir -p "$(dirname "$ROOT/$rel")"
    cp "$SRC/$rel" "$ROOT/$rel"
    echo "  restored $rel"
  fi
}

echo "Restoring design snapshot: $SNAP_NAME"
copy_if app/page.tsx
copy_if app/globals.css
copy_if app/katalog/page.tsx
copy_if components/CatalogCard.tsx
copy_if components/Header.tsx
copy_if components/LeadForm.tsx
copy_if components/HomeSeoLinks.tsx
copy_if data/home.json

if [[ "$SNAP_NAME" == *pre-vision* ]] && [[ -f "$ROOT/components/HomeSeoLinks.tsx" ]]; then
  echo "  note: HomeSeoLinks.tsx remains on disk but old homepage does not import it"
fi

echo ""
echo "Local files restored. Live site unchanged."
echo "To publish: bash scripts/deploy.sh"
echo "home.json is excluded from rsync — this script can push it after deploy if you pass --push-home"

if [[ "${2:-}" == "--push-home" ]]; then
  KEY="${DEPLOY_SSH_KEY:-$HOME/.ssh/besedki_deploy}"
  HOST="${DEPLOY_HOST:-root@31.128.44.47}"
  rsync -az --checksum -e "ssh -i $KEY -o IdentitiesOnly=yes" \
    "$ROOT/data/home.json" "$HOST:/var/www/besedki/data/home.json"
  echo "  pushed data/home.json to server"
fi

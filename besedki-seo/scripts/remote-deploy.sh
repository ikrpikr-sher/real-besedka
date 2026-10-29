#!/usr/bin/env bash
# Runs ON THE SERVER after rsync. Builds in a sibling tree (default .next),
# then swaps atomically. If build or health-check fails, the previous .next stays live.
#
# Do not use NEXT_DIST_DIR=.next-staging: Next 14.2 App Router dies after compile
# with ENOENT pages-manifest.json / _app.js.nft.json, and live .next is never swapped.
set -euo pipefail

APP_DIR="${1:-/var/www/besedki}"
APP_NAME="${PM2_APP_NAME:-besedki}"
PORT="${APP_PORT:-3000}"

LOCK="${DEPLOY_LOCK:-/var/lock/besedki-deploy.lock}"
mkdir -p "$(dirname "$LOCK")"
exec 9>"$LOCK"
if ! flock -n 9; then
  echo "ERROR: another deploy holds $LOCK — not starting a second Next build."
  exit 1
fi

PREV=".next-prev"
ACTIVE=".next"
BUILD_ROOT="${APP_DIR}.build"

cd "$APP_DIR"

echo "==> Installing dependencies..."
npm install

echo "==> Building Next.js in $BUILD_ROOT (live $ACTIVE untouched)..."
rm -rf "$BUILD_ROOT"
mkdir -p "$BUILD_ROOT"
rsync -a \
  --exclude '.next' \
  --exclude '.next-staging' \
  --exclude '.next-prev' \
  --exclude 'node_modules' \
  --exclude '.git' \
  "$APP_DIR/" "$BUILD_ROOT/"
ln -sfn "$APP_DIR/node_modules" "$BUILD_ROOT/node_modules"

if ! (
  cd "$BUILD_ROOT"
  unset NEXT_DIST_DIR || true
  npm run build
); then
  echo "ERROR: build failed — site keeps the previous build."
  rm -rf "$BUILD_ROOT"
  exit 1
fi

if [ ! -f "$BUILD_ROOT/.next/BUILD_ID" ] || [ ! -d "$BUILD_ROOT/.next/server" ]; then
  echo "ERROR: build output is incomplete — site keeps the previous build."
  rm -rf "$BUILD_ROOT"
  exit 1
fi

echo "==> Swapping $BUILD_ROOT/.next → $ACTIVE..."
rm -rf "$PREV"
if [ -d "$ACTIVE" ]; then
  mv "$ACTIVE" "$PREV"
fi
mv "$BUILD_ROOT/.next" "$ACTIVE"
rm -rf "$BUILD_ROOT"

echo "==> Restarting PM2 ($APP_NAME)..."
pm2 startOrRestart ecosystem.config.cjs --only "$APP_NAME" 2>/dev/null || pm2 restart "$APP_NAME"
pm2 save 2>/dev/null || true

echo "==> Health check http://127.0.0.1:$PORT/ ..."
ready=0
for i in $(seq 1 15); do
  sleep 2
  if curl -sf --max-time 10 "http://127.0.0.1:$PORT/" >/dev/null; then
    ready=1
    break
  fi
  echo "    waiting for app... ($i/15)"
done

if [ "$ready" != 1 ]; then
  echo "ERROR: health check failed — rolling back to previous build."
  rm -rf "$ACTIVE"
  if [ -d "$PREV" ]; then
    mv "$PREV" "$ACTIVE"
    pm2 restart "$APP_NAME"
    sleep 4
    if curl -sf --max-time 10 "http://127.0.0.1:$PORT/" >/dev/null; then
      echo "Rollback succeeded — previous version is live again."
    else
      echo "CRITICAL: rollback also failed. Run: pm2 logs $APP_NAME"
    fi
  fi
  exit 1
fi

rm -rf "$PREV"
CSS_FILE="$(ls -1 "$ACTIVE/static/css/"*.css 2>/dev/null | head -1 || true)"
if [[ -n "$CSS_FILE" ]]; then
  curl -sf --max-time 20 "http://127.0.0.1:$PORT/" | python3 scripts/build-snapshot-home.py "$CSS_FILE" > public/snapshot-home.html
else
  curl -sf --max-time 20 "http://127.0.0.1:$PORT/" > public/snapshot-home.html
fi
SNAP_BYTES=$(wc -c < public/snapshot-home.html 2>/dev/null || echo 0)
SNAP_SCRIPTS=$(grep -c '<script' public/snapshot-home.html 2>/dev/null || echo 0)
echo "==> Deploy OK. BUILD_ID=$(cat "$ACTIVE/BUILD_ID") snapshot=${SNAP_BYTES} bytes scripts=${SNAP_SCRIPTS}"

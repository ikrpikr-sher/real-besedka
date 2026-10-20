#!/usr/bin/env bash
# Экстренная стабилизация прода: swap + nginx Connection + PM2 memory cap.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
HOST="${DEPLOY_HOST:-root@31.128.44.47}"
KEY="${DEPLOY_SSH_KEY:-$HOME/.ssh/besedki_deploy}"
REMOTE="${DEPLOY_REMOTE:-/var/www/besedki}"
SSH="ssh -i $KEY -o IdentitiesOnly=yes"

echo "==> Upload nginx map + ecosystem config..."
scp -i "$KEY" -o IdentitiesOnly=yes \
  "$ROOT/deploy/nginx-connection-map.conf" \
  "$HOST:/etc/nginx/conf.d/connection-upgrade.conf"
scp -i "$KEY" -o IdentitiesOnly=yes \
  "$ROOT/ecosystem.config.cjs" \
  "$HOST:$REMOTE/ecosystem.config.cjs"

echo "==> Apply swap + nginx + pm2 on server..."
$SSH "$HOST" bash -s <<REMOTE
set -euo pipefail
REMOTE_DIR="$REMOTE"

if [ ! -f /swapfile ]; then
  echo "Creating 2G swap..."
  fallocate -l 2G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=2048
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  grep -q '/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
else
  swapon /swapfile 2>/dev/null || true
fi
echo "Swap:"
swapon --show || true
free -h

for f in /etc/nginx/sites-enabled/real-besedki.ru /etc/nginx/sites-enabled/nodejs; do
  if [ -f "\$f" ] && grep -q 'Connection "upgrade"' "\$f"; then
    sed -i 's/proxy_set_header Connection "upgrade";/proxy_set_header Connection \$connection_upgrade;/' "\$f"
    echo "  fixed Connection header in \$f"
  fi
done

nginx -t
systemctl reload nginx

cd "\$REMOTE_DIR"
pm2 delete besedki 2>/dev/null || true
pm2 start ecosystem.config.cjs
pm2 save

sleep 3
curl -sf --max-time 15 http://127.0.0.1:3000/ >/dev/null
echo "==> Health OK"
pm2 status
REMOTE

echo "Emergency fix applied."

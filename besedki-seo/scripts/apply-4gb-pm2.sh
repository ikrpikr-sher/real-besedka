#!/usr/bin/env bash
# Применить PM2-конфиг после апгрейда VPS до 4 GB RAM в панели Beget.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
HOST="${DEPLOY_HOST:-root@31.128.44.47}"
KEY="${DEPLOY_SSH_KEY:-$HOME/.ssh/besedki_deploy}"
REMOTE="${DEPLOY_REMOTE:-/var/www/besedki}"
SSH="ssh -i $KEY -o IdentitiesOnly=yes"

echo "==> Upload ecosystem.config.4gb.cjs..."
scp -i "$KEY" -o IdentitiesOnly=yes \
  "$ROOT/ecosystem.config.4gb.cjs" \
  "$HOST:$REMOTE/ecosystem.config.4gb.cjs"

$SSH "$HOST" bash -s <<REMOTE
set -euo pipefail
cd "$REMOTE"
TOTAL_KB=\$(grep MemTotal /proc/meminfo | awk '{print \$2}')
TOTAL_GB=\$(( TOTAL_KB / 1024 / 1024 ))
echo "RAM: \${TOTAL_GB} GB"
if [ "\$TOTAL_GB" -lt 3 ]; then
  echo "ERROR: RAM still under 3 GB. Upgrade VPS in Beget panel first (Cloud VPS -> Resize -> 4 GB)."
  exit 1
fi
cp ecosystem.config.4gb.cjs ecosystem.config.cjs
pm2 delete besedki 2>/dev/null || true
pm2 start ecosystem.config.cjs
pm2 save
sleep 2
pm2 status
free -h
REMOTE

echo "4 GB PM2 config applied."

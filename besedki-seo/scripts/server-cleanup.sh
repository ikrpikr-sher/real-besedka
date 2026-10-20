#!/usr/bin/env bash
# Очистка диска на VPS + подготовка к апгрейду RAM.
set -euo pipefail

HOST="${DEPLOY_HOST:-root@31.128.44.47}"
KEY="${DEPLOY_SSH_KEY:-$HOME/.ssh/besedki_deploy}"
SSH="ssh -i $KEY -o IdentitiesOnly=yes"

echo "==> Disk cleanup on $HOST..."
$SSH "$HOST" bash -s <<'REMOTE'
set -euo pipefail
echo "Before:"
df -h /

# PM2 / nginx logs
journalctl --vacuum-time=7d 2>/dev/null || true
find /root/.pm2/logs -type f -name '*.log' -size +10M -delete 2>/dev/null || true
truncate -s 0 /root/.pm2/logs/besedki-out.log 2>/dev/null || true
truncate -s 0 /root/.pm2/logs/besedki-error.log 2>/dev/null || true

# apt cache
apt-get clean 2>/dev/null || true
apt-get autoremove -y 2>/dev/null || true

# old next builds (keep current .next)
find /var/www/besedki -maxdepth 1 -type d -name '.next-*' -mtime +7 -exec rm -rf {} + 2>/dev/null || true

# junk accidentally synced to site root (real files live in app/, components/, lib/)
rm -f /var/www/besedki/*.report.html /var/www/besedki/*.png /var/www/besedki/*.mdx 2>/dev/null || true
rm -f /var/www/besedki/AdminNav.tsx /var/www/besedki/CatalogCard.tsx /var/www/besedki/catalogCategories.ts 2>/dev/null || true
rm -f /var/www/besedki/layout.tsx /var/www/besedki/mangalCatalog.ts /var/www/besedki/page.tsx 2>/dev/null || true
rm -f /var/www/besedki/YandexMetrika.tsx /var/www/besedki/tailwind.config.ts /var/www/besedki/.DS_Store 2>/dev/null || true
rm -f /var/www/besedki/tsconfig.tsbuildinfo /var/www/besedki/next.config.mjs.bak* 2>/dev/null || true
rm -rf /var/www/besedki/\(protected\) /var/www/besedki/\[slug\] /var/www/besedki/login 2>/dev/null || true
find /var/www/besedki -maxdepth 2 -name '.bak-*' -delete 2>/dev/null || true
find /var/www/besedki/data -name '*.bak*' -delete 2>/dev/null || true
find /var/www/besedki/lib /var/www/besedki/app -maxdepth 1 -name '*.bak*' -delete 2>/dev/null || true

# PNG/JPG duplicates (site prefers .webp)
if [ -f /var/www/besedki/scripts/prune-catalog-png.mjs ]; then
  node /var/www/besedki/scripts/prune-catalog-png.mjs --write 2>/dev/null || true
fi
if [ -f /var/www/besedki/scripts/prune-catalog-jpg.mjs ]; then
  node /var/www/besedki/scripts/prune-catalog-jpg.mjs --write 2>/dev/null || true
fi

rm -rf /var/cache/nginx/besedki/* 2>/dev/null || true

echo "After:"
df -h /
free -h
REMOTE

echo "Cleanup done."

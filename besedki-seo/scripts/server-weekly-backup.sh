#!/usr/bin/env bash
# Еженедельный бэкап критичных данных НА VPS (каталог, заявки, nginx, PM2).
# Хранится в /var/backups/besedki/ — переживает деплой, не зависит от Mac.
set -euo pipefail

APP="${APP_ROOT:-/var/www/besedki}"
DEST="${BACKUP_DEST:-/var/backups/besedki}"
KEEP="${BACKUP_KEEP:-8}"
stamp="$(date -u +%Y%m%d-%H%M%S)"
out="$DEST/weekly-$stamp"

mkdir -p "$out"/{data,nginx,pm2,content}

echo "==> Server weekly backup → $out"

# Критичные JSON (каталог, заявки, контент админки)
rsync -a "$APP/data/" "$out/data/" \
  --include='*.json' \
  --exclude='katalog.before-*' \
  --exclude='*.before-*' \
  --exclude='*.bak' || true

# Блог
if [[ -d "$APP/content/blog" ]]; then
  rsync -a "$APP/content/blog/" "$out/content/blog/"
fi

# Nginx
cp -a /etc/nginx/sites-enabled/real-besedki.ru "$out/nginx/" 2>/dev/null || true
cp -a /etc/nginx/sites-enabled/nodejs "$out/nginx/" 2>/dev/null || true
cp -a /etc/nginx/conf.d/*.conf "$out/nginx/" 2>/dev/null || true

# PM2
cp -a "$APP/ecosystem.config.cjs" "$out/pm2/" 2>/dev/null || true
cp -a /root/.pm2/dump.pm2 "$out/pm2/" 2>/dev/null || true
crontab -l > "$out/pm2/root.crontab" 2>/dev/null || true

# Манифест
{
  echo "stamp=$stamp"
  echo "host=$(hostname)"
  echo "katalog_items=$(python3 -c "import json; print(len(json.load(open('$APP/data/katalog.json'))))" 2>/dev/null || echo '?')"
  echo "leads_bytes=$(wc -c < "$APP/data/leads.json" 2>/dev/null || echo 0)"
  echo "disk=$(df -h / | awk 'NR==2 {print $3 "/" $2 " used " $5}')"
} > "$out/MANIFEST.txt"

# Архив
tar -C "$DEST" -czf "$DEST/weekly-$stamp.tar.gz" "weekly-$stamp"
rm -rf "$out"

# Ротация: оставляем последние KEEP архивов
ls -1t "$DEST"/weekly-*.tar.gz 2>/dev/null | tail -n +"$((KEEP + 1))" | xargs -r rm -f

echo "OK: $DEST/weekly-$stamp.tar.gz"
ls -lh "$DEST"/weekly-*.tar.gz 2>/dev/null | head -10

#!/usr/bin/env bash
# После перезагрузки VPS Beget поднимает hello-world на :3000 — этот скрипт возвращает besedki.
set -euo pipefail

APP_ROOT="${APP_ROOT:-/var/www/besedki}"

if ss -tlnp | grep -q ':3000.*hello-world'; then
  sudo -u nodejs pm2 delete hello-world 2>/dev/null || true
fi

body="$(curl -sf --max-time 8 http://127.0.0.1:3000/ | head -c 8000 || true)"
needs_restart=0

if [[ -z "$body" ]]; then
  needs_restart=1
elif ! grep -q '<!DOCTYPE html>' <<<"$body"; then
  needs_restart=1
elif grep -qi 'Hello, World' <<<"$body"; then
  needs_restart=1
elif ! grep -qi 'беседк' <<<"$body"; then
  needs_restart=1
fi

if [[ "$needs_restart" -eq 1 ]]; then
  cd "$APP_ROOT"
  pm2 delete hello-world 2>/dev/null || true
  pm2 delete besedki 2>/dev/null || true
  pm2 start ecosystem.config.cjs
  pm2 save
fi

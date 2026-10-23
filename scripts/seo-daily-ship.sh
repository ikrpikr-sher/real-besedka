#!/usr/bin/env bash
# Ежедневный пилот seoDescription: максимум 3 карточки.
# Не трогает priceFrom и не заливает целый katalog.json.
set -euo pipefail
cd "$(dirname "$0")/.."
ROOT="$(pwd)"
SITE="$ROOT/besedki-seo"
AGENT="$ROOT/real-besedki-seo-agent"
STAMP="$(date -u +%Y-%m-%d)"
LOG_DIR="$AGENT/logs"
SHIP_LOG="$LOG_DIR/${STAMP}_ship.md"
LIMIT="${SEO_DESC_LIMIT:-3}"
if [[ "$LIMIT" -gt 3 ]]; then
  LIMIT=3
fi

mkdir -p "$LOG_DIR" "$HOME/.ssh"

if [[ ! -f "${DEPLOY_SSH_KEY:-$HOME/.ssh/besedki_deploy}" ]]; then
  if [[ -n "${BESEDKI_DEPLOY_SSH_KEY:-}" && "$BESEDKI_DEPLOY_SSH_KEY" == *"BEGIN"* ]]; then
    printf '%s\n' "$BESEDKI_DEPLOY_SSH_KEY" > "$HOME/.ssh/besedki_deploy"
    chmod 600 "$HOME/.ssh/besedki_deploy"
  fi
fi
export DEPLOY_SSH_KEY="${DEPLOY_SSH_KEY:-$HOME/.ssh/besedki_deploy}"
if [[ ! -f "$HOME/.ssh/known_hosts" ]] || ! grep -q '31.128.44.47' "$HOME/.ssh/known_hosts"; then
  ssh-keyscan -T 10 -H 31.128.44.47 >> "$HOME/.ssh/known_hosts" 2>/dev/null || true
fi

echo "=== SEO daily ship $(date '+%Y-%m-%d %H:%M %Z') ==="

HOST="${DEPLOY_HOST:-root@31.128.44.47}"
REMOTE="${DEPLOY_REMOTE:-/var/www/besedki}"
SSH="ssh -i $DEPLOY_SSH_KEY -o IdentitiesOnly=yes -o BatchMode=yes"
TODAY_UTC="$(date -u +%Y%m%d)"
REMOTE_SHIPS="$($SSH "$HOST" "ls $REMOTE/data/backups/katalog.json.before-merge.${TODAY_UTC}*.json 2>/dev/null | wc -l" | tr -d ' ' || true)"

if [[ -f "$SHIP_LOG" ]] && grep -qE '^filled: [1-9]' "$SHIP_LOG"; then
  echo "Локальный ship-лог уже есть за сегодня — повторно не пушим."
  echo "Лог: $SHIP_LOG"
  cat "$SHIP_LOG"
  exit 0
fi
if [[ "${REMOTE_SHIPS:-0}" -ge 1 ]]; then
  echo "На сервере уже есть merge каталога за сегодня ($REMOTE_SHIPS) — LaunchAgent, повторно не пушим."
  {
    echo "# SEO ship $STAMP"
    echo ""
    echo "filled: 0"
    echo "slugs: —"
    echo "skipped: remote merge already existed today"
    echo "priceFrom: не менялся"
    echo "целый katalog.json: не заливали"
  } > "$SHIP_LOG"
  echo "Лог: $SHIP_LOG"
  exit 0
fi

if [[ ! -f "$DEPLOY_SSH_KEY" ]]; then
  echo "ERROR: нет SSH-ключа деплоя ($DEPLOY_SSH_KEY и BESEDKI_DEPLOY_SSH_KEY)."
  exit 1
fi

bash "$SITE/scripts/sync-katalog-from-server.sh"

RESULT="$(node "$SITE/scripts/fill-seo-descriptions.mjs" --limit "$LIMIT")"
echo "$RESULT"

FILLED="$(python3 -c 'import json,sys; print(int(json.loads(sys.argv[1]).get("filled") or 0))' "$RESULT")"
SLUGS="$(python3 -c 'import json,sys; print(",".join(json.loads(sys.argv[1]).get("slugs") or []))' "$RESULT")"
PREVIEWS="$(python3 -c 'import json,sys; print(json.dumps(json.loads(sys.argv[1]).get("previews") or [], ensure_ascii=False, indent=2))' "$RESULT")"

{
  echo "# SEO ship $STAMP"
  echo ""
  echo "filled: $FILLED"
  echo "slugs: ${SLUGS:-—}"
  echo "limit: $LIMIT"
  echo "priceFrom: не менялся"
  echo "целый katalog.json: не заливали"
  echo ""
  echo '```json'
  echo "$PREVIEWS"
  echo '```'
} > "$SHIP_LOG"

if [[ "$FILLED" -eq 0 ]]; then
  echo "Пустых seoDescription нет — пуш каталога не нужен."
  echo "Лог: $SHIP_LOG"
  exit 0
fi

bash "$SITE/scripts/sync-katalog-to-server.sh" --slugs "$SLUGS"
echo "ok: uploaded seoDescription for $SLUGS"
echo "Лог: $SHIP_LOG"

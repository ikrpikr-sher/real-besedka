#!/usr/bin/env bash
# Ежедневный SEO-ship: до 3 seoDescription, merge только этих slug, цены с сервера.
# Не заливает целый katalog.json и не трогает priceFrom.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SITE="$ROOT/besedki-seo"
LOG_DIR="$ROOT/real-besedki-seo-agent/logs"
TODAY="$(date -u +%Y-%m-%d)"
SHIP_LOG="$LOG_DIR/${TODAY}_ship.md"
LIMIT="${SEO_SHIP_LIMIT:-3}"
FORCE=0

for arg in "$@"; do
  case "$arg" in
    --force) FORCE=1 ;;
    --limit=*) LIMIT="${arg#--limit=}" ;;
    --help|-h)
      echo "Usage: bash scripts/seo-daily-ship.sh [--force] [--limit=3]"
      exit 0
      ;;
  esac
done

mkdir -p "$LOG_DIR"

if [[ "$FORCE" -ne 1 && -f "$SHIP_LOG" ]] && grep -q '^status: ok' "$SHIP_LOG"; then
  echo "=== SEO daily ship already done $TODAY ==="
  cat "$SHIP_LOG"
  exit 0
fi

if [[ -n "${BESEDKI_DEPLOY_SSH_KEY:-}" && "$BESEDKI_DEPLOY_SSH_KEY" == *"BEGIN"* && ! -f "${DEPLOY_SSH_KEY:-$HOME/.ssh/besedki_deploy}" ]]; then
  mkdir -p "$HOME/.ssh"
  KEY_PATH="${DEPLOY_SSH_KEY:-$HOME/.ssh/besedki_deploy}"
  printf '%s\n' "$BESEDKI_DEPLOY_SSH_KEY" > "$KEY_PATH"
  chmod 600 "$KEY_PATH"
fi

echo "=== SEO daily ship $TODAY (limit=$LIMIT) ==="

(cd "$SITE" && bash scripts/sync-katalog-from-server.sh)

FILL_JSON="$(node "$SITE/scripts/fill-seo-descriptions.mjs" --limit "$LIMIT")"
echo "$FILL_JSON"

FILLED="$(python3 -c "import json,sys; print(json.loads(sys.argv[1]).get('filled') or 0)" "$FILL_JSON")"
SLUGS="$(python3 -c "import json,sys; print(','.join(json.loads(sys.argv[1]).get('slugs') or []))" "$FILL_JSON")"

{
  echo "# SEO daily ship — $TODAY"
  echo ""
  echo "limit: $LIMIT"
  echo "filled: $FILLED"
  echo "slugs: ${SLUGS:-—}"
  echo ""
  echo '```json'
  echo "$FILL_JSON"
  echo '```'
  echo ""
} > "$SHIP_LOG"

if [[ "${FILLED:-0}" -eq 0 ]]; then
  echo "status: ok" >> "$SHIP_LOG"
  echo "note: нет пустых seoDescription — пушить нечего." >> "$SHIP_LOG"
  echo "Нет пустых seoDescription. Ship не менял прод."
  cat "$SHIP_LOG"
  exit 0
fi

(cd "$SITE" && bash scripts/sync-katalog-to-server.sh --slugs "$SLUGS")
echo "status: ok" >> "$SHIP_LOG"
echo "pushed_slugs: $SLUGS" >> "$SHIP_LOG"
echo "prices: kept from server" >> "$SHIP_LOG"
echo "Залиты только slug: $SLUGS (priceFrom с сервера)."
cat "$SHIP_LOG"

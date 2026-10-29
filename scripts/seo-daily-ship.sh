#!/usr/bin/env bash
# Ежедневный SEO-ship: до 3 seoDescription, push только по slug.
# Не трогает priceFrom и не заливает целый katalog.json.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SITE="$ROOT/besedki-seo"
LOGDIR="$ROOT/real-besedki-seo-agent/logs"
mkdir -p "$LOGDIR"
STAMP="$(date +%Y-%m-%d)"
SHIP_LOG="$LOGDIR/${STAMP}_ship.md"
LIMIT="${SEO_SHIP_LIMIT:-3}"
if (( LIMIT > 3 )); then LIMIT=3; fi
FORCE=0
for arg in "$@"; do
  case "$arg" in
    --force) FORCE=1 ;;
    --limit)
      echo "Use SEO_SHIP_LIMIT=N (max 3)" >&2
      exit 2
      ;;
  esac
done

ensure_key() {
  local key="${DEPLOY_SSH_KEY:-$HOME/.ssh/besedki_deploy}"
  if [[ ! -f "$key" && -n "${BESEDKI_DEPLOY_SSH_KEY:-}" ]]; then
    mkdir -p "$HOME/.ssh"
    printf '%s\n' "$BESEDKI_DEPLOY_SSH_KEY" > "$key"
    chmod 600 "$key"
  fi
}

if [[ -f "$SHIP_LOG" && "$FORCE" -eq 0 ]]; then
  echo "Ship already logged today: $SHIP_LOG"
  cat "$SHIP_LOG"
  echo "Re-run with --force to ship again (still max 3)."
  exit 0
fi

ensure_key
echo "=== SEO daily ship $STAMP (limit $LIMIT) ==="
bash "$SITE/scripts/sync-katalog-from-server.sh"

FILL_JSON="$(node "$SITE/scripts/fill-seo-descriptions.mjs" --limit "$LIMIT")"
echo "$FILL_JSON"

FILLED="$(python3 -c "import json,sys; print(json.loads(sys.argv[1]).get('filled',0))" "$FILL_JSON")"
SLUGS="$(python3 -c "import json,sys; print(','.join(json.loads(sys.argv[1]).get('slugs') or []))" "$FILL_JSON")"

{
  echo "# SEO ship — $STAMP"
  echo
  echo "- Limit: $LIMIT"
  echo "- Filled: $FILLED"
  echo "- Slugs: ${SLUGS:-—}"
  echo
  echo '```json'
  echo "$FILL_JSON"
  echo '```'
} > "$SHIP_LOG"

if [[ "$FILLED" == "0" || -z "$SLUGS" ]]; then
  echo "Push: skipped (filled=0)" | tee -a "$SHIP_LOG"
  echo "Log: $SHIP_LOG"
  exit 0
fi

bash "$SITE/scripts/sync-katalog-to-server.sh" --slugs "$SLUGS"
{
  echo
  echo "Push slugs: \`$SLUGS\` (priceFrom с сервера, целый katalog не заливался)."
} >> "$SHIP_LOG"
echo "Log: $SHIP_LOG"
echo "=== ship done ==="

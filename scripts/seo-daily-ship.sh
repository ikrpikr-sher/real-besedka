#!/usr/bin/env bash
# Ежедневный пилот seoDescription: максимум 3 карточки, без priceFrom и целого katalog.json.
# Если LaunchAgent уже сделал ship сегодня — повторно не пишет, только проверяет лог.
set -euo pipefail
cd "$(dirname "$0")/.."
ROOT="$(pwd)"
SITE="$ROOT/besedki-seo"
STAMP="$(date -u +%Y-%m-%d)"
LOG_DIR="$ROOT/real-besedki-seo-agent/logs"
LOG="$LOG_DIR/${STAMP}_ship.md"
LIMIT="${SEO_SHIP_LIMIT:-3}"
export PYTHONUNBUFFERED=1

mkdir -p "$LOG_DIR"

if [[ ! -f "$SITE/scripts/ship-seo-descriptions.mjs" ]]; then
  echo "ERROR: missing $SITE/scripts/ship-seo-descriptions.mjs" >&2
  exit 1
fi

if [[ -f "$LOG" ]] && grep -q 'filled: [1-9]' "$LOG"; then
  echo "=== SEO daily ship $STAMP — already shipped today, verify only ==="
  cat "$LOG"
  echo "=== verify-only exit 0 ==="
  exit 0
fi

echo "=== SEO daily ship $STAMP ==="
echo "Pulling katalog.json from production (source of truth)..."
bash "$SITE/scripts/sync-katalog-from-server.sh"

echo "Filling up to $LIMIT empty published seoDescription fields (dry-run first)..."
DRY="$(node "$SITE/scripts/ship-seo-descriptions.mjs" --file "$SITE/data/katalog.json" --limit "$LIMIT" --dry-run)"
echo "$DRY"

SLUGS="$(python3 -c "import json,sys; print(','.join(json.loads(sys.argv[1]).get('slugs') or []))" "$DRY")"
FILLED="$(python3 -c "import json,sys; print(json.loads(sys.argv[1]).get('filled') or 0)" "$DRY")"

{
  echo "# SEO daily ship — $STAMP"
  echo ""
  echo "Сайт: https://real-besedki.ru/ · пилот seoDescription ≤ ${LIMIT} карточек"
  echo ""
} > "$LOG"

if [[ -z "$SLUGS" || "$FILLED" -eq 0 ]]; then
  echo "No empty published seoDescription left (or limit 0)."
  {
    echo "filled: 0"
    echo "slugs: —"
    echo "status: nothing to ship"
  } >> "$LOG"
  echo "=== ship done (noop) ==="
  exit 0
fi

echo "Writing $FILLED snippets for $SLUGS..."
LIVE="$(node "$SITE/scripts/ship-seo-descriptions.mjs" --file "$SITE/data/katalog.json" --limit "$LIMIT")"
echo "$LIVE"

echo "Pushing only slugs $SLUGS (server prices kept)..."
bash "$SITE/scripts/sync-katalog-to-server.sh" --slugs "$SLUGS"

{
  echo "filled: $FILLED"
  echo "slugs: $SLUGS"
  echo ""
  echo '```json'
  echo "$LIVE"
  echo '```'
  echo ""
  echo "Прод: merge по slug, priceFrom с сервера. Целый katalog.json не заливался."
} >> "$LOG"

echo "Wrote $LOG"
echo "=== ship done ==="

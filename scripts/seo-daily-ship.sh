#!/usr/bin/env bash
# Ежедневный SEO-ship: максимум 3 seoDescription, только merge по slug.
# Не трогает priceFrom. Не заливает целый katalog.json.
set -euo pipefail
cd "$(dirname "$0")/.."
ROOT="$(pwd)"
SITE="$ROOT/besedki-seo"
STAMP="$(date +%Y-%m-%d)"
LOG_DIR="$ROOT/real-besedki-seo-agent/logs"
mkdir -p "$LOG_DIR"
SHIP_LOG="$LOG_DIR/${STAMP}_ship.md"
LIMIT="${SEO_SHIP_LIMIT:-3}"

echo "=== SEO daily ship ${STAMP} $(date '+%H:%M %Z') ==="

if [[ ! -f "${DEPLOY_SSH_KEY:-$HOME/.ssh/besedki_deploy}" ]]; then
  if [[ -n "${BESEDKI_DEPLOY_SSH_KEY:-}" && "$BESEDKI_DEPLOY_SSH_KEY" == *"BEGIN"* ]]; then
    mkdir -p "$HOME/.ssh"
    printf '%s\n' "$BESEDKI_DEPLOY_SSH_KEY" > "$HOME/.ssh/besedki_deploy"
    chmod 600 "$HOME/.ssh/besedki_deploy"
  else
    echo "ERROR: нет ~/.ssh/besedki_deploy и BESEDKI_DEPLOY_SSH_KEY"
    exit 1
  fi
fi

if [[ -f "$SHIP_LOG" ]] && grep -q 'filled: [1-9]' "$SHIP_LOG"; then
  echo "Ship уже записан сегодня. Лог:"
  cat "$SHIP_LOG"
  echo "=== already shipped today ==="
  exit 0
fi

echo "1/4 sync katalog.json с прода (источник правды)..."
bash "$SITE/scripts/sync-katalog-from-server.sh"

BEFORE_EMPTY="$(python3 - <<'PY'
import json
from pathlib import Path
items = json.loads(Path("besedki-seo/data/katalog.json").read_text(encoding="utf-8"))
empty = [i.get("slug") for i in items if not str(i.get("seoDescription") or "").strip()]
print(len(empty))
PY
)"

echo "2/4 пустых seoDescription: ${BEFORE_EMPTY}. Пилот до ${LIMIT}..."
FILL_JSON_FILE="$(mktemp)"
trap 'rm -f "$FILL_JSON_FILE"' EXIT
node "$SITE/scripts/fill-seo-descriptions.mjs" --limit "$LIMIT" | tee "$FILL_JSON_FILE"
SLUGS="$(python3 -c 'import json,sys; print(",".join(json.load(open(sys.argv[1])).get("slugs") or []))' "$FILL_JSON_FILE")"
FILL_JSON="$(cat "$FILL_JSON_FILE")"

{
  echo "# SEO daily ship — ${STAMP}"
  echo ""
  echo "Пустых до прогона: ${BEFORE_EMPTY}"
  echo ""
  echo '```json'
  echo "$FILL_JSON"
  echo '```'
  echo ""
} > "$SHIP_LOG"

if [[ -z "$SLUGS" ]]; then
  echo "filled: 0" >> "$SHIP_LOG"
  echo "Нечего писать — все приоритетные карточки уже с seoDescription."
  echo "=== ship noop ==="
  exit 0
fi

echo "3/4 merge на прод только slug: ${SLUGS}"
bash "$SITE/scripts/sync-katalog-to-server.sh" --slugs "$SLUGS"

AFTER_EMPTY="$(python3 - <<'PY'
import json
from pathlib import Path
items = json.loads(Path("besedki-seo/data/katalog.json").read_text(encoding="utf-8"))
empty = [i.get("slug") for i in items if not str(i.get("seoDescription") or "").strip()]
print(len(empty))
PY
)"

{
  echo "filled: $(echo "$SLUGS" | awk -F, '{print NF}')"
  echo "slugs: ${SLUGS}"
  echo "Пустых после: ${AFTER_EMPTY}"
  echo "priceFrom не менялся. Целый katalog.json на сервер не заливали."
} >> "$SHIP_LOG"

echo "4/4 лог: $SHIP_LOG"
echo "=== ship ok slugs=${SLUGS} ==="

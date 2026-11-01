#!/usr/bin/env bash
# Ежедневный ship: пилот seoDescription ≤3 карточки.
# Не трогает priceFrom. Не заливает целый katalog.json (merge по --slugs).
set -euo pipefail
cd "$(dirname "$0")/.."
ROOT="$(pwd)"
SITE="$ROOT/besedki-seo"
STAMP="$(date -u +%Y-%m-%d)"
LOG_DIR="$ROOT/real-besedki-seo-agent/logs"
SHIP_LOG="$LOG_DIR/${STAMP}_ship.md"
mkdir -p "$LOG_DIR"

echo "=== SEO daily ship $(date '+%Y-%m-%d %H:%M %Z') ==="

ensure_deploy_key() {
  local key_file="${DEPLOY_SSH_KEY:-$HOME/.ssh/besedki_deploy}"
  if [[ -f "$key_file" ]]; then
    chmod 600 "$key_file" 2>/dev/null || true
    export DEPLOY_SSH_KEY="$key_file"
    return 0
  fi
  if [[ -n "${BESEDKI_DEPLOY_SSH_KEY:-}" && "$BESEDKI_DEPLOY_SSH_KEY" == *"BEGIN"* ]]; then
    mkdir -p "$HOME/.ssh"
    printf '%s\n' "$BESEDKI_DEPLOY_SSH_KEY" > "$key_file"
    chmod 600 "$key_file"
    export DEPLOY_SSH_KEY="$key_file"
    echo "SSH key written to $key_file"
    return 0
  fi
  echo "ERROR: no deploy key (~/.ssh/besedki_deploy or BESEDKI_DEPLOY_SSH_KEY)"
  return 1
}

if [[ -f "$SHIP_LOG" ]]; then
  echo "Ship-лог за сегодня уже есть: $SHIP_LOG"
  echo "---"
  cat "$SHIP_LOG"
  echo "---"
  echo "Проверяю каталог и при необходимости допишу пустые сниппеты (лимит 3)."
fi

ensure_deploy_key

echo "1/3 sync katalog.json с прода (источник правды, цены не трогаем)"
bash "$SITE/scripts/sync-katalog-from-server.sh"

echo "2/3 fill seoDescription — максимум 3 карточки"
FILL_JSON="$(node "$SITE/scripts/fill-seo-descriptions.mjs" --limit 3)"
echo "$FILL_JSON"

FILLED="$(python3 -c "import json,sys; print(json.loads(sys.argv[1]).get('filled',0))" "$FILL_JSON")"
SLUGS="$(python3 -c "import json,sys; print(','.join(json.loads(sys.argv[1]).get('slugs') or []))" "$FILL_JSON")"

{
  echo "# SEO daily ship — ${STAMP}"
  echo ""
  echo "Лимит: 3 карточки. priceFrom не менялся. Целый katalog.json на прод не заливали."
  echo ""
  echo '```json'
  echo "$FILL_JSON"
  echo '```'
  echo ""
} > "$SHIP_LOG"

if [[ "${FILLED:-0}" -eq 0 || -z "$SLUGS" ]]; then
  echo "Пустых seoDescription нет (или лимит уже закрыт). Push не нужен."
  echo "Статус: filled=0" >> "$SHIP_LOG"
  echo "=== ship done (noop) ==="
  exit 0
fi

echo "3/3 push:katalog --slugs $SLUGS (цены с сервера)"
(cd "$SITE" && bash scripts/sync-katalog-to-server.sh --slugs "$SLUGS")

echo "" >> "$SHIP_LOG"
echo "Залиты slug: \`$SLUGS\` через merge (priceFrom с сервера)." >> "$SHIP_LOG"
echo "=== ship done slugs=$SLUGS ==="
echo "Лог: $SHIP_LOG"

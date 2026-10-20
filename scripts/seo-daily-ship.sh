#!/usr/bin/env bash
# Ежедневный ship: пилот seoDescription максимум 3 карточки.
# Не трогает priceFrom и не заливает целый katalog.json.
set -euo pipefail
cd "$(dirname "$0")/.."
ROOT="$(pwd)"
STAMP="$(date '+%Y-%m-%d')"
LOG_DIR="$ROOT/real-besedki-seo-agent/logs"
mkdir -p "$LOG_DIR"
SHIP_LOG="$LOG_DIR/${STAMP}_ship.md"

SITE_CODE="$ROOT/besedki-seo"
DEPLOY_KEY="${HOME}/.ssh/besedki_deploy"
MAX_CARDS=3

{
  echo "# SEO daily ship — ${STAMP}"
  echo
  echo "Сайт: https://real-besedki.ru/"
  echo "Лимит: ${MAX_CARDS} карточки seoDescription. priceFrom и целый katalog.json — запрещены."
  echo
} > "$SHIP_LOG"

if [[ ! -d "$SITE_CODE" ]]; then
  {
    echo "**Статус:** пропуск"
    echo
    echo "Нет каталога \`besedki-seo/\` в среде агента. Пилот seoDescription и \`deploy.sh\` не запускались."
  } >> "$SHIP_LOG"
  echo "=== SEO daily ship ${STAMP}: skip (no besedki-seo/) ==="
  echo "Лог: $SHIP_LOG"
  exit 0
fi

if [[ ! -f "$DEPLOY_KEY" ]]; then
  {
    echo "**Статус:** пропуск"
    echo
    echo "Код сайта есть, нет ключа \`~/.ssh/besedki_deploy\`. Деплой не запускался."
  } >> "$SHIP_LOG"
  echo "=== SEO daily ship ${STAMP}: skip (no deploy key) ==="
  echo "Лог: $SHIP_LOG"
  exit 0
fi

FILL="$SITE_CODE/scripts/fill-seo-descriptions.mjs"
PUSH="$SITE_CODE/scripts/sync-katalog-to-server.sh"
SYNC="$SITE_CODE/scripts/sync-katalog-from-server.sh"

if [[ ! -f "$FILL" || ! -f "$PUSH" ]]; then
  {
    echo "**Статус:** пропуск"
    echo
    echo "Нет \`fill-seo-descriptions.mjs\` или \`sync-katalog-to-server.sh\`."
  } >> "$SHIP_LOG"
  echo "=== SEO daily ship ${STAMP}: skip (no fill/push scripts) ==="
  echo "Лог: $SHIP_LOG"
  exit 0
fi

echo "=== SEO daily ship ${STAMP}: fill ≤${MAX_CARDS} seoDescription ==="
if [[ -x "$SYNC" || -f "$SYNC" ]]; then
  bash "$SYNC"
fi

FILL_JSON="$(node "$FILL" --limit "$MAX_CARDS")"
echo "$FILL_JSON"
echo "$FILL_JSON" > "$LOG_DIR/${STAMP}_ship.json"

SLUGS="$(python3 -c 'import json,sys; print(",".join(json.load(sys.stdin).get("slugs") or []))' <<<"$FILL_JSON")"

{
  echo "**Статус:** пилот"
  echo
  echo '```json'
  echo "$FILL_JSON"
  echo '```'
  echo
} >> "$SHIP_LOG"

if [[ -z "$SLUGS" ]]; then
  echo "Нет карточек без seoDescription — push не нужен." | tee -a "$SHIP_LOG"
  echo "Лог: $SHIP_LOG"
  exit 0
fi

echo "Push slugs (seoDescription only, prices from server): $SLUGS"
bash "$PUSH" --slugs "$SLUGS"

{
  echo "Залиты slug: \`$SLUGS\` через \`push:katalog --slugs\` (цены с сервера, целый файл не scp)."
  echo
} >> "$SHIP_LOG"

echo "=== SEO daily ship ${STAMP}: ok ($SLUGS) ==="
echo "Лог: $SHIP_LOG"
exit 0

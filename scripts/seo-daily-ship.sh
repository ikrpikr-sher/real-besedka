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
    echo
    echo "Когда код и ключ появятся:"
    echo "1. Выбрать до ${MAX_CARDS} карточек без уникального текста."
    echo "2. Заполнить только \`seoDescription\` (не title массово, не priceFrom)."
    echo "3. \`cd besedki-seo && bash scripts/deploy.sh\` — без rsync целого katalog.json."
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

{
  echo "**Статус:** код и ключ на месте, но ship-пилота seoDescription в этом репо нет."
  echo
  echo "Не запускаю массовые правки каталога. Нужен явный \`push:katalog --slugs\` на 1–${MAX_CARDS} карточки."
} >> "$SHIP_LOG"
echo "=== SEO daily ship ${STAMP}: blocked (no slug pilot command) ==="
echo "Лог: $SHIP_LOG"
exit 0

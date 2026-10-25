#!/usr/bin/env bash
# Ежедневный пилот SEO: до 3 seoDescription, без priceFrom и без целого katalog.json.
set -euo pipefail
cd "$(dirname "$0")/.."
ROOT="$(pwd)"
SITE="$ROOT/besedki-seo"
STAMP="$(date -u +%Y-%m-%d)"
LOG_DIR="$ROOT/real-besedki-seo-agent/logs"
SHIP_LOG="$LOG_DIR/${STAMP}_ship.md"
LIMIT="${SEO_SHIP_LIMIT:-3}"

mkdir -p "$LOG_DIR"

if [[ -n "${BESEDKI_DEPLOY_SSH_KEY:-}" && "$BESEDKI_DEPLOY_SSH_KEY" == *"BEGIN"* && ! -f "${HOME}/.ssh/besedki_deploy" ]]; then
  mkdir -p "${HOME}/.ssh"
  printf '%s\n' "$BESEDKI_DEPLOY_SSH_KEY" > "${HOME}/.ssh/besedki_deploy"
  chmod 600 "${HOME}/.ssh/besedki_deploy"
fi

echo "=== SEO daily ship ${STAMP} ==="

if [[ -f "$SHIP_LOG" ]] && grep -q 'status: shipped' "$SHIP_LOG"; then
  echo "Ship already done today. Log: $SHIP_LOG"
  cat "$SHIP_LOG"
  exit 0
fi

if [[ ! -x "$SITE/scripts/sync-katalog-from-server.sh" ]]; then
  echo "ERROR: missing $SITE/scripts/sync-katalog-from-server.sh" >&2
  exit 1
fi

echo "1/4 pull catalog from prod..."
(cd "$SITE" && bash scripts/sync-katalog-from-server.sh)

BEFORE_EMPTY="$(python3 - <<'PY'
import json
items=json.load(open("besedki-seo/data/katalog.json"))
empty=[i["slug"] for i in items if not (i.get("seoDescription") or "").strip()]
print(len(empty))
print(",".join(empty[:12]))
PY
)"
EMPTY_COUNT="$(printf '%s\n' "$BEFORE_EMPTY" | sed -n '1p')"
EMPTY_PREVIEW="$(printf '%s\n' "$BEFORE_EMPTY" | sed -n '2p')"
echo "  empty seoDescription: $EMPTY_COUNT ($EMPTY_PREVIEW)"

if [[ "${EMPTY_COUNT}" -eq 0 ]]; then
  cat > "$SHIP_LOG" <<EOF
# SEO ship — ${STAMP}

status: shipped
filled: 0
slugs:
note: все карточки уже с seoDescription, писать нечего
EOF
  echo "Nothing to fill."
  exit 0
fi

echo "2/4 fill up to ${LIMIT} empty snippets (local copy)..."
FILL_JSON="$(node "$SITE/scripts/fill-seo-descriptions.mjs" --file "$SITE/data/katalog.json" --limit "$LIMIT")"
echo "$FILL_JSON"
SLUGS="$(python3 -c "import json,sys; print(','.join(json.loads(sys.argv[1])['slugs']))" "$FILL_JSON")"
FILLED="$(python3 -c "import json,sys; print(json.loads(sys.argv[1])['filled'])" "$FILL_JSON")"

if [[ -z "$SLUGS" || "$FILLED" -eq 0 ]]; then
  echo "No slugs filled."
  exit 0
fi

echo "3/4 dry-run merge --slugs $SLUGS (prices stay on server)..."
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
KEY="${DEPLOY_SSH_KEY:-$HOME/.ssh/besedki_deploy}"
HOST="${DEPLOY_HOST:-root@31.128.44.47}"
REMOTE="${DEPLOY_REMOTE:-/var/www/besedki}"
scp -i "$KEY" -o IdentitiesOnly=yes "$HOST:$REMOTE/data/katalog.json" "$TMP/remote.json"
node "$SITE/scripts/merge-katalog.mjs" --base "$TMP/remote.json" --patch "$SITE/data/katalog.json" --out "$TMP/merged.json" --slugs "$SLUGS"

python3 - <<PY
import json
base=json.load(open("$TMP/remote.json"))
merged=json.load(open("$TMP/merged.json"))
slugs=set("$SLUGS".split(","))
by_b={i["slug"]:i for i in base}
by_m={i["slug"]:i for i in merged}
assert len(merged)>=len(base), "merge dropped items"
for slug in slugs:
    b, m = by_b[slug], by_m[slug]
    assert b.get("priceFrom")==m.get("priceFrom"), f"priceFrom changed for {slug}"
    assert (m.get("seoDescription") or "").strip(), f"empty seoDescription after fill {slug}"
print("dry-run ok: prices unchanged, snippets present for", ",".join(sorted(slugs)))
PY

echo "4/4 upload merge --slugs $SLUGS..."
(cd "$SITE" && bash scripts/sync-katalog-to-server.sh --slugs "$SLUGS")

{
  echo "# SEO ship — ${STAMP}"
  echo
  echo "status: shipped"
  echo "filled: ${FILLED}"
  echo "slugs: ${SLUGS}"
  echo
  echo '```json'
  echo "$FILL_JSON"
  echo '```'
  echo
  echo "priceFrom: не менялся (merge с сервера)"
} > "$SHIP_LOG"

echo "Ship log: $SHIP_LOG"
echo "=== SEO daily ship done ==="

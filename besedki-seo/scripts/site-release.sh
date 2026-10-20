#!/usr/bin/env bash
# Версионированный коммит (+ тег) сайта после крупных правок.
# Usage:
#   bash scripts/site-release.sh "кратко что изменилось"
#   bash scripts/site-release.sh "..." --push
#   bash scripts/site-release.sh "..." --push --deploy
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
REPO="$(cd "$ROOT/.." && pwd)"
NOTE="${1:-}"
DO_PUSH=0
DO_DEPLOY=0
for arg in "${@:2}"; do
  case "$arg" in
    --push) DO_PUSH=1 ;;
    --deploy) DO_DEPLOY=1 ;;
    *) echo "Unknown flag: $arg" >&2; exit 1 ;;
  esac
done

if [[ -z "$NOTE" || "$NOTE" == --* ]]; then
  echo "Usage: bash scripts/site-release.sh \"что изменилось\" [--push] [--deploy]" >&2
  exit 1
fi

TODAY="$(date +%Y.%m.%d)"
TODAY_ISO="$(date +%Y-%m-%d)"
PREV="$(tr -d '[:space:]' < "$ROOT/VERSION" 2>/dev/null || true)"
N=1
if [[ "$PREV" == "$TODAY".* ]]; then
  N=$(( ${PREV##*.} + 1 ))
fi
VER="${TODAY}.${N}"
TAG="site-v${VER}"

echo "$VER" > "$ROOT/VERSION"

# package.json version → YYYY.MM.DD-N (semver-ish for npm)
# npm wants X.Y.Z — use 2026.10.20-1 style via pre-release: 0.0.0-2026.10.20.1
node -e "
const fs=require('fs');
const p='$ROOT/package.json';
const j=JSON.parse(fs.readFileSync(p,'utf8'));
j.version='0.0.0-$VER';
fs.writeFileSync(p, JSON.stringify(j,null,2)+'\n');
"

REL="$ROOT/docs/SITE-RELEASES.md"
if [[ ! -f "$REL" ]]; then
  cat > "$REL" <<EOF
# Релизы сайта real-besedki.ru

Формат версии: \`YYYY.MM.DD.N\`. Git-тег: \`site-vYYYY.MM.DD.N\`.

| Версия | Дата | Тег | Что вошло |
|---|---|---|---|
EOF
fi

# Insert new row after header separator (line with |---|)
TMP="$(mktemp)"
awk -v ver="$VER" -v day="$TODAY_ISO" -v tag="$TAG" -v note="$NOTE" '
  BEGIN { done=0 }
  /^\|---/ && !done {
    print
    printf "| %s | %s | `%s` | %s |\n", ver, day, tag, note
    done=1
    next
  }
  { print }
' "$REL" > "$TMP" && mv "$TMP" "$REL"

cd "$REPO"
git add \
  besedki-seo/VERSION \
  besedki-seo/docs/SITE-RELEASES.md \
  besedki-seo/package.json \
  besedki-seo/ \
  .cursor/rules/site-versioning.mdc \
  2>/dev/null || true

# Never stage secrets / catalog / heavy media
git reset -q -- \
  'besedki-seo/.env' 'besedki-seo/.env.*' \
  'besedki-seo/data/katalog.json' 'besedki-seo/data/leads.json' \
  2>/dev/null || true

if git diff --cached --quiet; then
  # still allow tagging if only VERSION changed already staged elsewhere
  if ! git diff --quiet -- besedki-seo/VERSION; then
    git add besedki-seo/VERSION besedki-seo/docs/SITE-RELEASES.md besedki-seo/package.json
  fi
fi

git commit -m "$(cat <<EOF
site: release v${VER}

${NOTE}
EOF
)" || {
  echo "Nothing to commit (working tree clean for release paths?)." >&2
  exit 1
}

git tag -a "$TAG" -m "site v${VER}: ${NOTE}"

echo "Created commit + tag ${TAG}"

if [[ "$DO_PUSH" -eq 1 ]]; then
  git push origin HEAD
  git push origin "$TAG"
  echo "Pushed to GitHub: ${TAG}"
fi

if [[ "$DO_DEPLOY" -eq 1 ]]; then
  (cd "$ROOT" && bash scripts/deploy.sh)
  echo "Deployed v${VER} to production."
fi

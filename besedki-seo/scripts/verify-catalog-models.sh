#!/usr/bin/env bash
# Проверка целостности 3D-каталога перед деплоем.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CONFIG="$ROOT/data/catalog-models.json"
MODELS_DIR="$ROOT/public/models"
KATALOG="$ROOT/data/katalog.json"
MIN_GLB_BYTES=50000

errors=0
warn=0

fail() { echo "ERROR: $1" >&2; errors=$((errors + 1)); }
warn_msg() { echo "WARN:  $1" >&2; warn=$((warn + 1)); }
ok() { echo "  ok: $1"; }

echo "=== Verify catalog 3D models ==="

if [[ ! -f "$CONFIG" ]]; then
  fail "Missing $CONFIG"
  exit 1
fi

# slug list: товары из katalog.json (не kacheli), иначе все из config
slugs="$(python3 - <<PY
import json
with open("$CONFIG") as f:
    cfg = json.load(f)
configured = set(cfg["models"].keys())
required = configured
if __import__("os").path.isfile("$KATALOG"):
    with open("$KATALOG") as f:
        items = json.load(f)
    required = {i["slug"] for i in items if i.get("category") != "kacheli"}
    required &= configured
else:
    required = configured
print("\n".join(sorted(required)))
PY
)"

slug_count="$(echo "$slugs" | grep -c . || true)"
echo "Config slugs: $slug_count"

# GLB files. В git их нет (rsync-exclude) — локальная пустая папка не должна валить деплой кода.
local_glb_count="$(find "$MODELS_DIR" -maxdepth 1 -name '*.glb' 2>/dev/null | wc -l | tr -d ' ')"
if [[ "${local_glb_count:-0}" -eq 0 ]] && grep -q 'public/models/\*\.glb' "$ROOT/.rsync-exclude" 2>/dev/null; then
  warn_msg "local public/models has no GLB (gitignored / rsync-exclude) — skip file check, server models stay"
else
  for slug in $slugs; do
    glb="$MODELS_DIR/${slug}.glb"
    if [[ ! -f "$glb" ]]; then
      fail "Missing GLB: public/models/${slug}.glb (run: npm run export:models)"
      continue
    fi
    size="$(wc -c < "$glb" | tr -d ' ')"
    if [[ "$size" -lt "$MIN_GLB_BYTES" ]]; then
      fail "GLB too small (${size} B): ${slug}.glb — likely corrupt export"
      continue
    fi
    ok "${slug}.glb (${size} bytes)"
  done
fi

# npm deps for model-viewer
if ! grep -q '"@google/model-viewer"' "$ROOT/package.json"; then
  fail "package.json missing @google/model-viewer"
fi
if ! grep -q '"three"' "$ROOT/package.json"; then
  fail "package.json missing three (peer dependency of model-viewer)"
fi

lock="$ROOT/package-lock.json"
if [[ -f "$lock" ]] && ! grep -q '"three"' "$lock"; then
  warn_msg "three not in package-lock.json — run npm install locally before deploy"
fi

# rsync must not exclude models dir entirely; GLB files on server must not be overwritten by deploy
if grep -q '^public/models$' "$ROOT/.rsync-exclude" 2>/dev/null; then
  fail "public/models must not be fully excluded — use public/models/*.glb instead"
fi
if ! grep -q '^data/katalog\.json$' "$ROOT/.rsync-exclude" 2>/dev/null; then
  fail "Add data/katalog.json to .rsync-exclude — deploy must not overwrite prod catalog"
fi
if ! grep -q 'public/models/\*\.glb' "$ROOT/.rsync-exclude" 2>/dev/null; then
  fail "Add public/models/*.glb to .rsync-exclude — deploy must not overwrite admin 3D uploads"
fi

# katalog slugs (local copy) should have 3D mapping
if [[ -f "$KATALOG" ]]; then
  missing_katalog="$(python3 - <<PY
import json
with open("$CONFIG") as f:
    cfg = json.load(f)
configured = set(cfg["models"].keys())
with open("$KATALOG") as f:
    items = json.load(f)
catalog_slugs = {i["slug"] for i in items if i.get("category") != "kacheli"}
missing = sorted(catalog_slugs - configured)
if missing:
    print(",".join(missing))
PY
)"
  if [[ -n "$missing_katalog" ]]; then
    warn_msg "katalog.json slugs without 3D config: $missing_katalog"
  fi
fi

# Blender build scripts exist
blender_dir="${BLENDER_SCRIPTS:-$HOME/real-besedka/blender}"
if [[ -d "$blender_dir" ]]; then
  while IFS= read -r script; do
    [[ -z "$script" ]] && continue
    if [[ ! -f "$blender_dir/$script" ]]; then
      fail "Blender script missing: $blender_dir/$script"
    fi
  done < <(python3 - <<PY
import json
with open("$CONFIG") as f:
    cfg = json.load(f)
for m in cfg["models"].values():
    print(m["buildScript"])
PY
)
  ok "Blender scripts in $blender_dir"
else
  warn_msg "Blender scripts dir not found ($blender_dir) — skip script check"
fi

echo ""
if [[ "$errors" -gt 0 ]]; then
  echo "FAILED: $errors error(s), $warn warning(s)"
  exit 1
fi

echo "PASSED: $slug_count models, $warn warning(s)"
exit 0

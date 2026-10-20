#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BLENDER="${BLENDER_BIN:-/Applications/Blender.app/Contents/MacOS/Blender}"
SCRIPT="$ROOT/scripts/blender/export_catalog_glb.py"

if [[ ! -x "$BLENDER" ]]; then
  echo "Blender not found at $BLENDER. Set BLENDER_BIN." >&2
  exit 1
fi

mkdir -p "$ROOT/public/models"

if [[ $# -gt 0 ]]; then
  "$BLENDER" --background --python "$SCRIPT" -- "$@"
else
  "$BLENDER" --background --python "$SCRIPT"
fi

# Не сжимаем GLB после экспорта — gltf-transform optimize удалял текстуры узоров.
# При необходимости: bash scripts/compress-catalog-glb.sh slug1 slug2

if [[ $# -gt 0 ]]; then
  for slug in "$@"; do
    glb="$ROOT/public/models/${slug}.glb"
    if [[ ! -f "$glb" ]]; then
      echo "ERROR: missing $glb" >&2
      exit 1
    fi
    size="$(wc -c < "$glb" | tr -d ' ')"
    if [[ "$size" -lt 50000 ]]; then
      echo "ERROR: $slug.glb too small (${size} B)" >&2
      exit 1
    fi
    node "$ROOT/scripts/verify-glb-textures.mjs" --slug "$slug" 2>/dev/null || true
    echo "  ok: ${slug}.glb (${size} bytes)"
  done
else
  bash "$ROOT/scripts/verify-catalog-models.sh"
fi

echo "GLB files in $ROOT/public/models/"

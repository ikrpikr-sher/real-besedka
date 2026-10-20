#!/usr/bin/env bash
# Экспорт .blend → GLB для загрузки в админку (на Mac с Blender).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BLENDER="${BLENDER_BIN:-/Applications/Blender.app/Contents/MacOS/Blender}"
SCRIPT="$ROOT/scripts/blender/export_blend_to_glb.py"

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 path/to/model.blend [output-name-without-ext]" >&2
  echo "Example: $0 ~/Downloads/Блендер\\ файлы/Besedka_6x3/besedka_6x3.blend b-16" >&2
  exit 1
fi

BLEND="$(cd "$(dirname "$1")" && pwd)/$(basename "$1")"
if [[ ! -f "$BLEND" ]]; then
  echo "File not found: $BLEND" >&2
  exit 1
fi

if [[ ! -x "$BLENDER" ]]; then
  echo "Blender not found at $BLENDER. Set BLENDER_BIN." >&2
  exit 1
fi

mkdir -p "$ROOT/public/models"
if [[ -n "${2:-}" ]]; then
  OUT="$ROOT/public/models/${2}.glb"
else
  base="$(basename "$BLEND" .blend)"
  OUT="$ROOT/public/models/${base}.glb"
fi

"$BLENDER" --background "$BLEND" --python "$SCRIPT" -- "$OUT"
echo "GLB ready: $OUT"
echo "Upload via admin or deploy: public/models/$(basename "$OUT")"

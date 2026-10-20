#!/usr/bin/env bash
# Сжимает GLB каталога (meshopt + dedup/join/weld). Безопасно перезаписывает файлы in-place.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MODELS="$ROOT/public/models"
CLI="$ROOT/node_modules/.bin/gltf-transform"

if [[ ! -x "$CLI" ]]; then
  echo "gltf-transform CLI not found. Run: npm install" >&2
  exit 1
fi

shopt -s nullglob
files=("$MODELS"/*.glb)
total=${#files[@]}

if [[ "$total" -eq 0 ]]; then
  echo "No GLB files in $MODELS" >&2
  exit 1
fi

echo "=== Optimize GLB (dedup/weld, без meshopt — model-viewer совместимость) ==="
MIN_BYTES=50000
before=0
after=0
i=0
skipped=0

for f in "${files[@]}"; do
  i=$((i + 1))
  name="$(basename "$f")"
  size_before="$(wc -c < "$f" | tr -d ' ')"
  before=$((before + size_before))
  tmp="${f}.compressing.glb"
  backup="${f}.before-compress.glb"

  echo "[$i/$total] $name ..."
  cp "$f" "$backup"
  if ! "$CLI" optimize "$f" "$tmp"; then
    echo "  WARN: compress failed — keeping original"
    rm -f "$tmp"
    after=$((after + size_before))
    continue
  fi

  size_after="$(wc -c < "$tmp" | tr -d ' ')"
  if [[ "$size_after" -lt "$MIN_BYTES" ]]; then
    echo "  WARN: ${size_after} B too small after compress — keeping original (${size_before} B)"
    rm -f "$tmp"
    after=$((after + size_before))
    skipped=$((skipped + 1))
    rm -f "$backup"
    continue
  fi

  mv "$tmp" "$f"
  rm -f "$backup"
  after=$((after + size_after))
  pct=$((100 - (size_after * 100 / size_before)))
  echo "  ${size_before} B -> ${size_after} B (-${pct}%)"
done

saved=$((before - after))
pct_total=$([[ "$before" -gt 0 ]] && echo $((saved * 100 / before)) || echo 0)
echo ""
echo "Done: $((before / 1024 / 1024)) MB -> $((after / 1024 / 1024)) MB (-${pct_total}%, saved $((saved / 1024 / 1024)) MB, skipped $skipped)"

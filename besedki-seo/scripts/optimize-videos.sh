#!/bin/bash
# Однократно: сжать уже загруженные MOV/MP4 в public/videos/
set -euo pipefail
DIR="/var/www/besedki/public/videos/blog"
cd "$DIR"
shopt -s nullglob
for f in *.mov *.MOV *.mp4 *.MP4 *.webm; do
  base="${f%.*}"
  out="${base}.mp4"
  poster="${base}-poster.jpg"
  if [[ -f "$out" && "$f" != "$out" ]]; then
    echo "skip $f (already has $out)"
    continue
  fi
  echo "optimizing $f ..."
  ffmpeg -i "$f" \
    -c:v libx264 -preset veryfast -crf 27 -maxrate 3500k -bufsize 7000k \
    -vf "scale='min(1920,iw)':'min(1080,ih)':force_original_aspect_ratio=decrease" \
    -c:a aac -b:a 128k -movflags +faststart -y "${base}.optimizing.mp4"
  mv "${base}.optimizing.mp4" "$out"
  ffmpeg -ss 1 -i "$out" -vframes 1 -q:v 4 -y "$poster" 2>/dev/null || true
  if [[ "$f" != "$out" ]]; then rm -f "$f"; fi
  ls -lh "$out" "$poster" 2>/dev/null || ls -lh "$out"
done
echo "done"

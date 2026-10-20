#!/usr/bin/env bash
# Генерирует manifest всех медиа, используемых на проде (katalog + blog).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="${1:-$ROOT/../besedki-seo-docs/site-assets-manifest.txt}"
node "$ROOT/scripts/cleanup-local-assets.mjs" --dry-run >/dev/null 2>&1 || true
node -e "
const fs=require('fs');const path=require('path');const matter=require('gray-matter');
const ROOT='$ROOT';
const k=JSON.parse(fs.readFileSync(path.join(ROOT,'data/katalog.prod.json'),'utf8'));
const refs=new Set();
for(const p of k){ if(p.model3d) refs.add(p.model3d); for(const i of (p.images||[])) refs.add(i); }
for(const f of fs.readdirSync(path.join(ROOT,'content/blog')).filter(x=>x.endsWith('.mdx'))){
  const {data}=matter(fs.readFileSync(path.join(ROOT,'content/blog',f),'utf8'));
  if(data.coverImage) refs.add(data.coverImage);
  for(const u of (data.videoUrls||[])) refs.add(u);
}
const lines=[...refs].sort();
fs.writeFileSync('$OUT', lines.join('\n')+'\n');
console.log('Manifest:', lines.length, 'paths →', '$OUT');
"

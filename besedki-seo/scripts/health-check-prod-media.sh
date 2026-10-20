#!/usr/bin/env bash
# Проверка медиа на проде: первое фото и GLB для каждой карточки.
set -euo pipefail

HOST="${DEPLOY_HOST:-root@31.128.44.47}"
KEY="${DEPLOY_SSH_KEY:-$HOME/.ssh/besedki_deploy}"
REMOTE="${DEPLOY_REMOTE:-/var/www/besedki}"
SSH="ssh -i $KEY -o IdentitiesOnly=yes"

echo "=== Catalog media health (prod) ==="

$SSH "$HOST" "node -" <<'NODE'
const fs = require('fs');
const path = require('path');

const ROOT = process.env.REMOTE || '/var/www/besedki';
const items = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/katalog.json'), 'utf8'));
const pub = path.join(ROOT, 'public');
const MIN_GLB = 50000;

let badHero = 0;
let badModel = 0;
let tinyModel = 0;

for (const it of items) {
  const imgs = (it.images || []).map((u) => u.split('?')[0]);
  const first = imgs[0];
  if (first) {
    const fp = path.join(pub, first.replace(/^\//, ''));
    if (!fs.existsSync(fp)) {
      badHero++;
      console.log('BAD HERO', it.slug, first);
    }
  } else {
    badHero++;
    console.log('NO IMAGES', it.slug);
  }

  if (it.category === 'kacheli') continue;
  const m = (it.model3d || `/models/${it.slug}.glb`).split('?')[0].replace(/^\//, '');
  const mp = path.join(pub, m);
  if (!fs.existsSync(mp)) {
    badModel++;
    console.log('BAD MODEL', it.slug, m);
  } else if (fs.statSync(mp).size < MIN_GLB) {
    tinyModel++;
    console.log('TINY MODEL', it.slug, fs.statSync(mp).size);
  }
}

console.log('');
console.log(`Items: ${items.length}`);
console.log(`Bad/missing hero: ${badHero}`);
console.log(`Missing model: ${badModel}`);
console.log(`Tiny model (<${MIN_GLB}B): ${tinyModel}`);

if (badHero > 0 || badModel > 0) process.exit(1);
NODE

echo "OK"

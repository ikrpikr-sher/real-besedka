#!/usr/bin/env node
/**
 * Заполняет seoDescription у карточек без сниппета (1–N за прогон).
 * Цены и фото не трогает. Логика = lib/productSeoDescription.ts (упрощённый порт).
 *
 * Usage:
 *   node scripts/fill-seo-descriptions.mjs --limit 3
 *   node scripts/fill-seo-descriptions.mjs --limit 3 --slugs b-10,b-12
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const KATALOG = path.join(ROOT, 'data', 'katalog.json');
const MAX = 250;

const KIND = {
  'otkrytye-besedki': 'Открытая металлическая беседка',
  'besedki-s-ostekleniem': 'Остеклённая металлическая беседка',
  'besedki-osteklennye-loft': 'Остеклённая беседка лофт',
  'besedki-s-mangalom': 'Беседка с мангалом',
  navesy: 'Металлический навес',
  mangaly: 'Мангал / мангальная зона',
  kacheli: 'Садовые качели из металла',
  pavilony: 'Металлический павильон',
};

function clip(text, max = MAX) {
  const compact = text.replace(/\s+/g, ' ').trim();
  if (compact.length <= max) return compact;
  const cut = compact.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 120 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}

function has(text, needle) {
  return String(text || '').toLowerCase().includes(needle.toLowerCase());
}

function hasAffirmative(text, needle) {
  const low = String(text || '').toLowerCase();
  const n = String(needle || '').toLowerCase();
  let from = 0;
  while (from < low.length) {
    const i = low.indexOf(n, from);
    if (i < 0) return false;
    const before = low.slice(Math.max(0, i - 16), i);
    if (!/(?:без|не)\s*$/.test(before)) return true;
    from = i + n.length;
  }
  return false;
}

function featureBits(item) {
  const blob = `${item.title} ${item.tagline ?? ''} ${item.description ?? ''}`;
  const bits = [];
  if (has(blob, '80×80') || has(blob, '80x80')) bits.push('каркас 80×80×3 мм');
  else if (item.material) {
    const shortMaterial = String(item.material).split(',')[0].trim();
    if (shortMaterial && shortMaterial.length <= 40) bits.push(shortMaterial);
  }
  if (has(blob, 'чпу') || has(blob, 'лазер')) bits.push('панели ЧПУ');
  if (hasAffirmative(blob, 'стеклопакет') || hasAffirmative(blob, 'остеклен')) bits.push('раздвижное остекление');
  if (has(blob, 'мангал') || item.category === 'besedki-s-mangalom') bits.push('зона жарки');
  if (has(blob, 'фанер')) bits.push('пол фанера в базе');
  if (item.roof && !has(item.roof, '—')) {
    bits.push(String(item.roof).toLowerCase().includes('черепиц') ? 'металлочерепица' : item.roof);
  }
  return [...new Set(bits)].slice(0, 3);
}

function buildSeo(item) {
  const kind = KIND[item.category] || 'Металлическое изделие';
  const article = String(item.slug || '').trim().toUpperCase();
  const size = (item.size || '').trim();
  const features = featureBits(item);
  const head = [kind, article ? `«${article}»` : '', size || ''].filter(Boolean).join(' ');
  const mid = features.length ? `${features.join(', ')}.` : 'Каркас 80×80, порошок.';
  const tail = 'Производство и монтаж в Москве и МО. Расчёт по заявке.';
  return clip(`${head}: ${mid} ${tail}`.replace(/:\s+\./, ':'));
}

function parseArgs(argv) {
  let limit = 3;
  let only = null;
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--limit' && argv[i + 1]) {
      limit = Math.max(1, Math.min(10, Number(argv[++i]) || 3));
    } else if (argv[i] === '--slugs' && argv[i + 1]) {
      only = new Set(
        argv[++i]
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      );
    }
  }
  return { limit, only };
}

const PRIORITY_CATS = [
  'otkrytye-besedki',
  'besedki-s-ostekleniem',
  'besedki-osteklennye-loft',
  'besedki-s-mangalom',
  'mangaly',
  'navesy',
  'kacheli',
  'pavilony',
];

const { limit, only } = parseArgs(process.argv.slice(2));
const items = JSON.parse(fs.readFileSync(KATALOG, 'utf8'));
const filled = [];

const candidates = [...items].sort((a, b) => {
  const ai = PRIORITY_CATS.indexOf(a.category);
  const bi = PRIORITY_CATS.indexOf(b.category);
  return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi);
});

for (const item of candidates) {
  if (filled.length >= limit) break;
  if (only && !only.has(item.slug)) continue;
  if ((item.seoDescription || '').trim()) continue;
  if (!item.category || !item.slug) continue;
  // черновики павильонов без витрины — в конец; всё равно можно заполнять
  item.seoDescription = buildSeo(item);
  filled.push({ slug: item.slug, seoDescription: item.seoDescription });
  // mutate original array item
  const orig = items.find((x) => x.slug === item.slug);
  if (orig) orig.seoDescription = item.seoDescription;
}

if (filled.length === 0) {
  console.log(JSON.stringify({ ok: true, filled: 0, slugs: [] }));
  process.exit(0);
}

fs.writeFileSync(KATALOG, `${JSON.stringify(items, null, 2)}\n`, 'utf8');
console.log(
  JSON.stringify(
    {
      ok: true,
      filled: filled.length,
      slugs: filled.map((x) => x.slug),
      previews: filled,
    },
    null,
    2,
  ),
);

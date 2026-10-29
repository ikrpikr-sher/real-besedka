#!/usr/bin/env node
/**
 * Пилот seoDescription: заполняет только пустые карточки, без priceFrom и фото.
 * Usage: node scripts/ship-seo-descriptions.mjs --file data/katalog.json --limit 3 [--dry-run]
 */
import fs from 'node:fs';

const args = process.argv.slice(2);
function arg(name) {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
}

const file = arg('--file');
const limit = Math.max(1, Math.min(3, Number(arg('--limit') || 3)));
const dryRun = args.includes('--dry-run');
const slugFilter = (arg('--slugs') || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

if (!file) {
  console.error('Usage: ship-seo-descriptions.mjs --file data/katalog.json --limit 3 [--dry-run]');
  process.exit(1);
}

const SEO_DESCRIPTION_MAX = 250;
const PUBLISHED = new Set([
  'otkrytye-besedki',
  'besedki-s-ostekleniem',
  'besedki-osteklennye-loft',
  'besedki-s-mangalom',
  'navesy',
  'mangaly',
  'kacheli',
  'pavilony',
]);

const KIND_LABEL = {
  'otkrytye-besedki': 'Открытая металлическая беседка',
  'besedki-s-ostekleniem': 'Остеклённая металлическая беседка',
  'besedki-osteklennye-loft': 'Остеклённая беседка лофт',
  'besedki-s-mangalom': 'Беседка с мангалом',
  navesy: 'Металлический навес',
  mangaly: 'Мангал / мангальная зона',
  kacheli: 'Садовые качели из металла',
  pavilony: 'Металлический павильон',
};

function firstSentence(text) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  if (!clean) return '';
  const match = clean.match(/^(.{40,180}?[.!?])(?:\s|$)/);
  return (match?.[1] || clean.slice(0, 160)).trim();
}

function has(text, needle) {
  return text.toLowerCase().includes(needle.toLowerCase());
}

function hasWord(text, needle) {
  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?:^|[^\\p{L}])${escaped}(?:$|[^\\p{L}])`, 'iu').test(text);
}

function featureBits(item) {
  const blob = `${item.title} ${item.tagline ?? ''} ${item.description}`;
  const bits = [];
  if (has(blob, '80×80') || has(blob, '80x80')) bits.push('каркас 80×80×3 мм');
  else if (item.material) {
    const shortMaterial = String(item.material).split(',')[0].trim();
    if (shortMaterial && shortMaterial.length <= 40) bits.push(shortMaterial);
  }
  if (has(blob, 'чпу') || has(blob, 'лазер')) bits.push('панели ЧПУ');
  const mentionsGlazing = has(blob, 'стеклопакет') || has(blob, 'остеклен');
  const noGlazing = has(blob, 'без остекл');
  if (mentionsGlazing && !noGlazing) bits.push('раздвижное остекление');
  if (has(blob, 'мангал') || item.category === 'besedki-s-mangalom') bits.push('зона жарки');
  if (has(blob, 'фанер') && hasWord(blob, 'пол')) bits.push('пол фанера в базе');
  else if (has(blob, 'дпк') && item.category === 'besedki-s-mangalom') bits.push('пол ДПК');
  if (item.roof && !has(item.roof, '—')) {
    bits.push(String(item.roof).toLowerCase().includes('черепиц') ? 'металлочерепица' : item.roof);
  }
  return [...new Set(bits)].slice(0, 3);
}

function clip(text, max = SEO_DESCRIPTION_MAX) {
  const compact = String(text).replace(/\s+/g, ' ').trim();
  if (compact.length <= max) return compact;
  const cut = compact.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 120 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}

function buildProductSeoDescription(item) {
  const kind = KIND_LABEL[item.category] || 'Металлическое изделие';
  const article = String(item.slug || '').trim().toUpperCase();
  const size = item.size?.trim();
  const features = featureBits(item);
  const head = [kind, article ? `«${article}»` : '', size || ''].filter(Boolean).join(' ');
  const mid = features.length ? `${features.join(', ')}.` : firstSentence(item.description);
  const tail = 'Производство и монтаж в Москве и МО. Расчёт по заявке.';
  const draft = clip(`${head}: ${mid} ${tail}`.replace(/:\s+\./, ':'));
  if (draft.length >= 110) return draft;
  return clip(`${head}. ${item.tagline || firstSentence(item.description) || 'Каркас 80×80, порошок.'} ${tail}`);
}

const items = JSON.parse(fs.readFileSync(file, 'utf8'));
if (!Array.isArray(items)) {
  console.error('katalog.json must be an array');
  process.exit(1);
}

function blobOf(item) {
  return `${item.title || ''} ${item.tagline || ''} ${item.description || ''}`;
}

function isFalseGlazing(item) {
  const stored = String(item.seoDescription || '');
  if (!stored.includes('раздвижное остекление')) return false;
  const blob = blobOf(item).toLowerCase();
  const mentionsGlazing = blob.includes('стеклопакет') || blob.includes('остеклен');
  const noGlazing = blob.includes('без остекл');
  return noGlazing || !mentionsGlazing;
}

const candidates = items.filter((item) => {
  if (!item.slug || !PUBLISHED.has(item.category)) return false;
  if (slugFilter.length) return slugFilter.includes(item.slug);
  return !String(item.seoDescription || '').trim() || isFalseGlazing(item);
});

candidates.sort((a, b) => Number(isFalseGlazing(b)) - Number(isFalseGlazing(a)));
const picked = candidates.slice(0, limit);
const shipped = [];

for (const item of picked) {
  const next = buildProductSeoDescription(item);
  if (!next || next === item.seoDescription) continue;
  if (!dryRun) item.seoDescription = next;
  shipped.push({
    slug: item.slug,
    category: item.category,
    title: item.title,
    seoDescription: next,
    length: next.length,
  });
}

if (!dryRun && shipped.length) {
  fs.writeFileSync(file, `${JSON.stringify(items, null, 2)}\n`);
}

const remainingEmptyPublished = items.filter(
  (item) => PUBLISHED.has(item.category) && !String(item.seoDescription || '').trim(),
).length;
console.log(
  JSON.stringify(
    {
      ok: true,
      dryRun,
      limit,
      filled: shipped.length,
      remainingEmptyPublished,
      slugs: shipped.map((row) => row.slug),
      items: shipped,
    },
    null,
    2,
  ),
);

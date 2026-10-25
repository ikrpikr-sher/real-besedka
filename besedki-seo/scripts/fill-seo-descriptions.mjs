#!/usr/bin/env node
/**
 * Заполняет seoDescription только у карточек без сниппета.
 * Цену, фото и остальные поля не меняет. Лимит по умолчанию — 3.
 *
 *   node scripts/fill-seo-descriptions.mjs --file data/katalog.json --limit 3
 */
import fs from 'node:fs';

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

const SEO_DESCRIPTION_MAX = 250;

function arg(name) {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

const file = arg('--file');
const limit = Math.min(3, Math.max(0, Number(arg('--limit') || 3)));
if (!file) {
  console.error('Usage: fill-seo-descriptions.mjs --file katalog.json [--limit 3]');
  process.exit(1);
}

function has(text, needle) {
  return String(text || '').toLowerCase().includes(needle.toLowerCase());
}

function firstSentence(text) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  if (!clean) return '';
  const match = clean.match(/^(.{40,180}?[.!?])(?:\s|$)/);
  return (match?.[1] || clean.slice(0, 160)).trim();
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
  if (has(blob, 'стеклопакет') || has(blob, 'остеклен')) bits.push('раздвижное остекление');
  if (has(blob, 'мангал') || item.category === 'besedki-s-mangalom') bits.push('зона жарки');
  if (has(blob, 'фанер')) bits.push('пол фанера в базе');
  else if (has(blob, 'дпк') && item.category === 'besedki-s-mangalom') bits.push('пол ДПК');
  if (item.roof && !has(item.roof, '—')) {
    bits.push(String(item.roof).toLowerCase().includes('черепиц') ? 'металлочерепица' : item.roof);
  }
  return [...new Set(bits)].slice(0, 3);
}

function clip(text, max = SEO_DESCRIPTION_MAX) {
  const compact = String(text || '').replace(/\s+/g, ' ').trim();
  if (compact.length <= max) return compact;
  const cut = compact.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 120 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}

function buildProductSeoDescription(item) {
  const kind = KIND_LABEL[item.category] || 'Металлическое изделие';
  const article = String(item.slug || '').trim().toUpperCase();
  const size = String(item.size || '').trim();
  const features = featureBits(item);
  const head = [kind, article ? `«${article}»` : '', size].filter(Boolean).join(' ');
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

const filled = [];
for (const item of items) {
  if (filled.length >= limit) break;
  if ((item.seoDescription || '').trim()) continue;
  const seoDescription = buildProductSeoDescription(item);
  if (!seoDescription) continue;
  item.seoDescription = seoDescription;
  filled.push({
    slug: item.slug,
    category: item.category,
    seoDescription,
    priceFrom: item.priceFrom,
  });
}

fs.writeFileSync(file, `${JSON.stringify(items, null, 2)}\n`);
console.log(JSON.stringify({ filled: filled.length, slugs: filled.map((x) => x.slug), items: filled }, null, 2));

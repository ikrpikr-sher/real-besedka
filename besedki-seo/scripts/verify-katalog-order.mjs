#!/usr/bin/env node
/** Smoke-test логики перестановки (копия алгоритма из lib/katalogStore.ts). */
import assert from 'node:assert/strict';

function reorderCatalogItems(items, orderedSlugs, category) {
  const bySlug = new Map(items.map((item) => [item.slug, item]));

  for (const slug of orderedSlugs) {
    if (!bySlug.has(slug)) throw new Error(`unknown ${slug}`);
  }

  if (category) {
    const inCategory = items.filter((item) => item.category === category);
    if (orderedSlugs.length !== inCategory.length) throw new Error('length mismatch');
    for (const slug of orderedSlugs) {
      if (bySlug.get(slug)?.category !== category) throw new Error('wrong category');
    }
    const queue = orderedSlugs.map((slug) => bySlug.get(slug));
    return items.map((item) => (item.category === category ? queue.shift() : item));
  }

  if (orderedSlugs.length !== items.length) throw new Error('full list required');
  if (new Set(orderedSlugs).size !== items.length) throw new Error('duplicates');
  return orderedSlugs.map((slug) => bySlug.get(slug));
}

const sample = [
  { slug: 'b-10', category: 'otkrytye-besedki' },
  { slug: 'b-21', category: 'besedki-s-ostekleniem' },
  { slug: 'b-11', category: 'otkrytye-besedki' },
  { slug: 'n-01', category: 'kacheli' },
];

assert.deepEqual(
  reorderCatalogItems(sample, ['n-01', 'b-10', 'b-21', 'b-11']).map((i) => i.slug),
  ['n-01', 'b-10', 'b-21', 'b-11'],
);

assert.deepEqual(
  reorderCatalogItems(sample, ['b-11', 'b-10'], 'otkrytye-besedki').map((i) => i.slug),
  ['b-11', 'b-21', 'b-10', 'n-01'],
);

let threw = false;
try {
  reorderCatalogItems(sample, ['b-10'], 'otkrytye-besedki');
} catch {
  threw = true;
}
assert.equal(threw, true);

console.log('verify-katalog-order: passed');

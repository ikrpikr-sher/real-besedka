#!/usr/bin/env node
/** Проверка GLB: есть ли текстуры (узоры панелей). exit 1 если есть модели без текстур среди панельных. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const MODELS = path.join(ROOT, 'public', 'models');
const CONFIG = path.join(ROOT, 'data', 'catalog-models.json');
const KATALOG = path.join(ROOT, 'data', 'katalog.json');

const cfg = JSON.parse(fs.readFileSync(CONFIG, 'utf8'));
const katalog = fs.existsSync(KATALOG) ? JSON.parse(fs.readFileSync(KATALOG, 'utf8')) : [];
const catalogSlugs = new Set(
  katalog.filter((i) => i.category !== 'kacheli').map((i) => i.slug),
);

const noPanelSlugs = new Set(['bm-32', 'm-04', 'm-05', 'm-06']);
const noPanelScripts = /mangal_canopy|mangal_diplomat|mangal_villa|mangal_premium|mangal_bar|mangal_tandyr|build_glazed_besedka|build_glazed_panels/;

const panelSlugs = new Set(
  Object.entries(cfg.models)
    .filter(([slug, m]) => {
      if (!catalogSlugs.has(slug) || noPanelSlugs.has(slug)) return false;
      const script = String(m.buildScript);
      if (script.includes('mangal_zone') || script.includes('kacheli')) return false;
      if (noPanelScripts.test(script)) return false;
      return true;
    })
    .map(([slug]) => slug),
);

function inspectGlb(glb) {
  let out = '';
  try {
    out = execSync(`npx gltf-transform inspect "${glb}"`, { cwd: ROOT, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
  } catch (e) {
    out = e.stdout || '';
  }
  return out;
}

function hasPanelPatternTextures(out) {
  if (/No textures found/i.test(out)) return false;
  if (/Panel_[A-Za-z0-9_]+\s.*baseColorTexture/i.test(out)) return true;
  if (/Art_[A-Za-z0-9_]+\s.*baseColorTexture/i.test(out)) return true;
  if (/Mat_Panel_\w+\s.*baseColorTexture/i.test(out)) return true;
  const hasPanelSheets = /Panel_[A-Za-z0-9_]+_(Sheet|Web)/i.test(out);
  if (hasPanelSheets) return false;
  return /baseColorTexture/i.test(out);
}

const missing = [];
const ok = [];

for (const slug of [...panelSlugs].sort()) {
  const glb = path.join(MODELS, `${slug}.glb`);
  if (!fs.existsSync(glb)) {
    missing.push({ slug, reason: 'no file' });
    continue;
  }
  let out = inspectGlb(glb);
  if (!hasPanelPatternTextures(out)) {
    missing.push({ slug, reason: /No textures found/i.test(out) ? 'no textures' : 'no panel pattern texture' });
  } else {
    ok.push(slug);
  }
}

console.log(`verify-glb-textures: ${ok.length} ok, ${missing.length} problem(s)`);
for (const m of missing) {
  console.log(`  MISSING ${m.slug}: ${m.reason}`);
}

process.exit(missing.length ? 1 : 0);

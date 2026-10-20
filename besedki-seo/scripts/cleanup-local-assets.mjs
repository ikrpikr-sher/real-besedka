#!/usr/bin/env node
/**
 * Сверка локальных медиа с прод-каталогом и блогом.
 * --pull-missing  — скачать с сервера недостающие файлы
 * --delete-orphans — удалить local public/* не referenced
 * --dry-run       — только отчёт
 */
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import matter from 'gray-matter';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = path.join(ROOT, 'public');
const KATALOG = path.join(ROOT, 'data/katalog.prod.json');
const BLOG_DIR = path.join(ROOT, 'content/blog');
const HOST = process.env.DEPLOY_HOST || 'root@31.128.44.47';
const KEY = process.env.DEPLOY_SSH_KEY || `${process.env.HOME}/.ssh/besedki_deploy`;
const REMOTE = process.env.DEPLOY_REMOTE || '/var/www/besedki';

const args = new Set(process.argv.slice(2));
const DRY = args.has('--dry-run');
const PULL = args.has('--pull-missing');
const DELETE = args.has('--delete-orphans');

function loadKatalog() {
  if (!fs.existsSync(KATALOG)) {
    console.error('Missing data/katalog.prod.json — run scp from server first.');
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(KATALOG, 'utf8'));
}

function collectBlogMedia() {
  const refs = new Set();
  if (!fs.existsSync(BLOG_DIR)) return refs;
  for (const file of fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.mdx'))) {
    const raw = fs.readFileSync(path.join(BLOG_DIR, file), 'utf8');
    const { data } = matter(raw);
    if (data.coverImage?.startsWith('/')) refs.add(data.coverImage);
    for (const url of data.videoUrls || []) {
      if (url.startsWith('/')) refs.add(url);
    }
    if (data.videoUrl?.startsWith('/')) refs.add(data.videoUrl);
  }
  return refs;
}

function collectRequired() {
  const required = new Set([
    '/favicon.ico',
    '/favicon-16.png',
    '/favicon-32.png',
    '/apple-touch-icon.png',
    '/meshopt_decoder.js',
  ]);

  for (const item of loadKatalog()) {
    if (item.model3d?.startsWith('/')) required.add(item.model3d);
    for (const img of item.images || []) {
      if (img.startsWith('/')) required.add(img);
    }
  }

  for (const ref of collectBlogMedia()) required.add(ref);

  // posters for blog videos
  for (const ref of [...required]) {
    if (ref.startsWith('/videos/') && ref.endsWith('.mp4')) {
      required.add(ref.replace(/\.mp4$/, '-poster.jpg'));
    }
  }

  return required;
}

function walkFiles(dir, prefix = '') {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const rel = `${prefix}/${name}`.replace(/\\/g, '/');
    const st = fs.statSync(full);
    if (st.isDirectory()) out.push(...walkFiles(full, rel));
    else out.push({ full, publicPath: rel, size: st.size });
  }
  return out;
}

function formatBytes(n) {
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)} GB`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)} MB`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(0)} KB`;
  return `${n} B`;
}

function pullMissing(missing) {
  if (missing.length === 0) return;
  console.log(`\nPulling ${missing.length} missing file(s) from server…`);
  for (const publicPath of missing) {
    const remoteFile = `${REMOTE}/public${publicPath}`;
    const localFile = path.join(PUBLIC, publicPath.slice(1));
    fs.mkdirSync(path.dirname(localFile), { recursive: true });
    const cmd = `scp -i "${KEY}" -o IdentitiesOnly=yes "${HOST}:${remoteFile}" "${localFile}"`;
    try {
      execSync(cmd, { stdio: 'pipe' });
      console.log(`  ok: ${publicPath}`);
    } catch {
      console.warn(`  FAIL: ${publicPath}`);
    }
  }
}

function deleteOrphans(orphans) {
  if (orphans.length === 0) return;
  console.log(`\nDeleting ${orphans.length} orphan file(s)…`);
  for (const { full, publicPath, size } of orphans) {
    if (DRY) {
      console.log(`  would delete ${publicPath} (${formatBytes(size)})`);
      continue;
    }
    fs.unlinkSync(full);
    console.log(`  deleted ${publicPath} (${formatBytes(size)})`);
  }
}

function main() {
  const required = collectRequired();
  console.log(`Required public assets: ${required.size}`);

  const scopes = ['images', 'videos', 'models'];
  let missing = [];
  let orphans = [];
  let orphanBytes = 0;

  for (const scope of scopes) {
    const dir = path.join(PUBLIC, scope);
    const files = walkFiles(dir, `/${scope}`);
    for (const f of files) {
      if (required.has(f.publicPath)) continue;
      if (scope === 'models' && !f.publicPath.endsWith('.glb')) continue;
      orphans.push(f);
      orphanBytes += f.size;
    }
  }

  for (const publicPath of required) {
    if (!publicPath.startsWith('/images/') && !publicPath.startsWith('/videos/') && !publicPath.startsWith('/models/')) {
      continue;
    }
    const local = path.join(PUBLIC, publicPath.slice(1));
    if (!fs.existsSync(local)) missing.push(publicPath);
  }

  console.log(`Missing locally: ${missing.length}`);
  console.log(`Orphans: ${orphans.length} (${formatBytes(orphanBytes)})`);

  if (missing.length) {
    console.log('\nMissing (first 20):');
    missing.slice(0, 20).forEach((p) => console.log(`  ${p}`));
    if (missing.length > 20) console.log(`  … +${missing.length - 20} more`);
  }

  if (PULL && !DRY) pullMissing(missing);
  if (DELETE) deleteOrphans(orphans);

  if (DRY) {
    console.log('\nDry run — no changes made.');
  }
}

main();

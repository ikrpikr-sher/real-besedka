import fs from 'node:fs';
import path from 'node:path';

const DATA_DIR = path.join(process.cwd(), 'data');
const BACKUP_DIR = path.join(DATA_DIR, 'backups');
const MAX_BACKUPS = 30;

/** Файлы с живыми данными — перед записью делаем бэкап и атомарный swap. */
const BACKUP_FILES = new Set(['katalog.json', 'proekty.json']);

/** Читает JSON-файл из /data. Бросает исключение, если файла нет — так и должно быть на этапе рендера. */
export function readJson<T>(file: string): T {
  const raw = fs.readFileSync(path.join(DATA_DIR, file), 'utf8');
  return JSON.parse(raw) as T;
}

/** Читает JSON-файл из /data, возвращая fallback, если файла ещё нет (например, data/leads.json при первом запуске). */
export function readJsonSafe<T>(file: string, fallback: T): T {
  try {
    return readJson<T>(file);
  } catch {
    return fallback;
  }
}

function pruneBackups(baseName: string): void {
  if (!fs.existsSync(BACKUP_DIR)) return;
  const prefix = `${baseName}.`;
  const files = fs
    .readdirSync(BACKUP_DIR)
    .filter((f) => f.startsWith(prefix))
    .sort()
    .reverse();
  for (const old of files.slice(MAX_BACKUPS)) {
    try {
      fs.unlinkSync(path.join(BACKUP_DIR, old));
    } catch {
      /* ignore */
    }
  }
}

function backupJsonFile(file: string, target: string): void {
  if (!fs.existsSync(target)) return;
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupName = `${path.basename(file)}.${stamp}.json`;
  fs.copyFileSync(target, path.join(BACKUP_DIR, backupName));
  pruneBackups(path.basename(file));
}

export function writeJson(file: string, data: unknown): void {
  const target = path.join(DATA_DIR, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });

  const payload = JSON.stringify(data, null, 2) + '\n';

  if (BACKUP_FILES.has(file) && fs.existsSync(target)) {
    backupJsonFile(file, target);
  }

  const tmp = `${target}.tmp-${process.pid}`;
  fs.writeFileSync(tmp, payload, 'utf8');
  fs.renameSync(tmp, target);
}

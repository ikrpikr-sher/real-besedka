import { execFile } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const BLEND_CONVERT_TIMEOUT_MS = 180_000;

export function findBlenderBinary(): string | null {
  const candidates = [
    process.env.BLENDER_BIN,
    '/opt/blender/blender',
    '/Applications/Blender.app/Contents/MacOS/Blender',
    '/usr/local/bin/blender',
    '/usr/bin/blender',
  ].filter(Boolean) as string[];

  for (const bin of candidates) {
    try {
      if (fs.existsSync(bin) && fs.statSync(bin).isFile()) return bin;
    } catch {
      /* skip */
    }
  }
  return null;
}

export async function convertBlendFileToGlb(blendPath: string, glbPath: string): Promise<void> {
  const blender = findBlenderBinary();
  if (!blender) {
    throw new Error(
      'На сервере нет Blender для конвертации .blend. Экспортируйте GLB в Blender: File → Export → glTF 2.0 (.glb), затем загрузите .glb файл.',
    );
  }

  const script = path.join(process.cwd(), 'scripts/blender/export_blend_to_glb.py');
  if (!fs.existsSync(script)) {
    throw new Error('Скрипт конвертации Blender не найден на сервере');
  }

  fs.mkdirSync(path.dirname(glbPath), { recursive: true });

  await execFileAsync(
    blender,
    ['--background', blendPath, '--python', script, '--', glbPath],
    { timeout: BLEND_CONVERT_TIMEOUT_MS, maxBuffer: 10 * 1024 * 1024 },
  );

  if (!fs.existsSync(glbPath) || fs.statSync(glbPath).size < 1024) {
    throw new Error('Blender не создал GLB — проверьте файл .blend');
  }
}

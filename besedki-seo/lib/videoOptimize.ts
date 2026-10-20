import { execFile, execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

let ffmpegChecked: boolean | null = null;

function ffmpegAvailable(): boolean {
  if (ffmpegChecked !== null) return ffmpegChecked;
  try {
    execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' });
    ffmpegChecked = true;
  } catch {
    ffmpegChecked = false;
  }
  return ffmpegChecked;
}

async function runFfmpeg(args: string[], timeoutMs: number): Promise<void> {
  const niceArgs = process.platform === 'linux' ? ['-n', '15', 'ffmpeg', ...args] : ['ffmpeg', ...args];
  const cmd = process.platform === 'linux' ? 'nice' : 'ffmpeg';
  const finalArgs = process.platform === 'linux' ? niceArgs : args;

  await execFileAsync(cmd, finalArgs, {
    timeout: timeoutMs,
    maxBuffer: 10 * 1024 * 1024,
  });
}

/** Конвертирует видео в MP4 для веба (H.264, faststart, до 1080p). Не блокирует event loop. */
export async function optimizeVideoFileAsync(inputPath: string): Promise<string> {
  const dir = path.dirname(inputPath);
  const base = path.basename(inputPath, path.extname(inputPath));
  const outputPath = path.join(dir, `${base}.mp4`);
  const posterPath = path.join(dir, `${base}-poster.jpg`);
  const tempPath = path.join(dir, `${base}.optimizing.mp4`);

  if (!ffmpegAvailable()) {
    return inputPath;
  }

  try {
    await runFfmpeg(
      [
        '-i',
        inputPath,
        '-c:v',
        'libx264',
        '-preset',
        'veryfast',
        '-threads',
        '2',
        '-crf',
        '28',
        '-maxrate',
        '2500k',
        '-bufsize',
        '5000k',
        '-vf',
        "scale='min(1920,iw)':'min(1080,ih)':force_original_aspect_ratio=decrease",
        '-c:a',
        'aac',
        '-b:a',
        '128k',
        '-movflags',
        '+faststart',
        '-y',
        tempPath,
      ],
      600_000,
    );

    fs.renameSync(tempPath, outputPath);

    try {
      await runFfmpeg(
        ['-ss', '1', '-i', outputPath, '-vframes', '1', '-q:v', '4', '-update', '1', '-y', posterPath],
        30_000,
      );
    } catch {
      if (fs.existsSync(posterPath)) fs.unlinkSync(posterPath);
    }

    if (inputPath !== outputPath && fs.existsSync(inputPath)) {
      fs.unlinkSync(inputPath);
    }

    return outputPath;
  } catch (err) {
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    console.error('[video-optimize] failed:', inputPath, err);
    return inputPath;
  }
}

export function expectedOptimizedVideoPath(inputPath: string): string {
  const dir = path.dirname(inputPath);
  const base = path.basename(inputPath, path.extname(inputPath));
  return path.join(dir, `${base}.mp4`);
}

export function posterFileForVideo(videoFilePath: string): string {
  return videoFilePath.replace(/\.(mp4|webm|mov)$/i, '-poster.jpg');
}

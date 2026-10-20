import { NextRequest, NextResponse } from 'next/server';
import { isAuthed } from '@/lib/adminAuth';
import { isAllowedImageUploadFolder, isAllowedUploadFolder, saveUploadedImage, saveUploadedModel3d, saveUploadedVideo } from '@/lib/adminUpload';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  if (!isAuthed()) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const form = await req.formData();
    const file = form.get('file');
    const folder = String(form.get('folder') || '');
    const kind = String(form.get('kind') || 'image');

    if (!(file instanceof File)) {
      return NextResponse.json({ ok: false, error: 'Выберите файл' }, { status: 400 });
    }

    if (kind === 'video') {
      if (!isAllowedUploadFolder(folder)) {
        return NextResponse.json({ ok: false, error: 'Недопустимая папка' }, { status: 400 });
      }
      const result = await saveUploadedVideo(folder, file.name, file);
      return NextResponse.json({ ok: true, path: result.path, processing: result.processing });
    }

    if (kind === 'model3d') {
      const slug = String(form.get('slug') || '').trim() || undefined;
      const modelPath = await saveUploadedModel3d(file.name, file, slug);
      return NextResponse.json({ ok: true, path: modelPath });
    }

    if (!isAllowedImageUploadFolder(folder)) {
      return NextResponse.json({ ok: false, error: 'Недопустимая папка' }, { status: 400 });
    }

    const path = await saveUploadedImage(folder, file.name, file);
    return NextResponse.json({ ok: true, path });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Не удалось загрузить файл';
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}

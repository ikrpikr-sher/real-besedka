import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { NextRequest, NextResponse } from 'next/server';
import { isAuthed } from '@/lib/adminAuth';
import { getPostBySlug, type PostFrontmatter } from '@/lib/blog';
import { normalizePostFrontmatter } from '@/lib/postFrontmatter';

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog');

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  if (!isAuthed()) return NextResponse.json({ ok: false }, { status: 401 });
  try {
    const post = getPostBySlug(params.slug);
    return NextResponse.json({ ok: true, item: post });
  } catch {
    return NextResponse.json({ ok: false, error: 'Не найдено' }, { status: 404 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { slug: string } }) {
  if (!isAuthed()) return NextResponse.json({ ok: false }, { status: 401 });
  const body = (await req.json()) as PostFrontmatter & { content: string };
  const filePath = path.join(BLOG_DIR, `${params.slug}.mdx`);
  if (!fs.existsSync(filePath)) return NextResponse.json({ ok: false, error: 'Не найдено' }, { status: 404 });

  const { content, frontmatter } = normalizePostFrontmatter(body);
  fs.writeFileSync(filePath, matter.stringify(content, frontmatter), 'utf8');
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: { slug: string } }) {
  if (!isAuthed()) return NextResponse.json({ ok: false }, { status: 401 });
  const filePath = path.join(BLOG_DIR, `${params.slug}.mdx`);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  return NextResponse.json({ ok: true });
}

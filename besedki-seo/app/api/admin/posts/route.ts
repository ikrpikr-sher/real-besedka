import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { NextRequest, NextResponse } from 'next/server';
import { isAuthed } from '@/lib/adminAuth';
import { getAllPosts, type PostFrontmatter } from '@/lib/blog';
import { normalizePostFrontmatter } from '@/lib/postFrontmatter';

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog');

export async function GET() {
  if (!isAuthed()) return NextResponse.json({ ok: false }, { status: 401 });
  return NextResponse.json({ ok: true, items: getAllPosts() });
}

export async function POST(req: NextRequest) {
  if (!isAuthed()) return NextResponse.json({ ok: false }, { status: 401 });
  const body = (await req.json()) as PostFrontmatter & { slug: string; content: string };
  if (!body.slug) return NextResponse.json({ ok: false, error: 'Укажите slug' }, { status: 400 });

  const filePath = path.join(BLOG_DIR, `${body.slug}.mdx`);
  if (fs.existsSync(filePath)) {
    return NextResponse.json({ ok: false, error: 'Статья с таким slug уже есть' }, { status: 409 });
  }

  const { content, frontmatter } = normalizePostFrontmatter(body);
  fs.mkdirSync(BLOG_DIR, { recursive: true });
  fs.writeFileSync(filePath, matter.stringify(content, frontmatter), 'utf8');

  return NextResponse.json({ ok: true });
}

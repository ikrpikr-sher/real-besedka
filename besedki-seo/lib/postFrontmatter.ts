import type { PostFrontmatter } from '@/lib/blog';

type PostSaveBody = PostFrontmatter & {
  content?: string;
  slug?: string;
};

export function normalizePostFrontmatter(body: PostSaveBody): {
  content: string;
  frontmatter: PostFrontmatter;
} {
  const { content, slug: _slug, videoUrl, videoUrls, ...rest } = body;

  const cleanedUrls = (videoUrls ?? [])
    .map((url) => url.trim())
    .filter(Boolean)
    .slice(0, 3);

  const legacyUrl = videoUrl?.trim();
  if (cleanedUrls.length === 0 && legacyUrl) {
    cleanedUrls.push(legacyUrl);
  }

  const frontmatter: PostFrontmatter = { ...rest };

  if (cleanedUrls.length > 0) {
    frontmatter.videoUrls = cleanedUrls;
  }

  delete frontmatter.videoUrl;

  return {
    content: content || '',
    frontmatter,
  };
}

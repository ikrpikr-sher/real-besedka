export function getPostVideos(post: { videoUrls?: string[]; videoUrl?: string }): string[] {
  if (post.videoUrls?.length) {
    return post.videoUrls.map((url) => url.trim()).filter(Boolean).slice(0, 3);
  }
  if (post.videoUrl?.trim()) {
    return [post.videoUrl.trim()];
  }
  return [];
}

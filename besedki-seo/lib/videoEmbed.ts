export type VideoEmbed =
  | { kind: 'iframe'; src: string; title: string }
  | { kind: 'file'; src: string; title: string };

export function parseVideoUrl(url: string, title = 'Видео'): VideoEmbed | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  const youtubeMatch = trimmed.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([\w-]+)/,
  );
  if (youtubeMatch) {
    return {
      kind: 'iframe',
      src: `https://www.youtube.com/embed/${youtubeMatch[1]}`,
      title,
    };
  }

  const rutubeMatch = trimmed.match(/rutube\.ru\/video\/([a-f0-9]+)/i);
  if (rutubeMatch) {
    return {
      kind: 'iframe',
      src: `https://rutube.ru/play/embed/${rutubeMatch[1]}`,
      title,
    };
  }

  const vkMatch = trimmed.match(/vk\.com\/video(-?\d+)_(\d+)/);
  if (vkMatch) {
    return {
      kind: 'iframe',
      src: `https://vk.com/video_ext.php?oid=${vkMatch[1]}&id=${vkMatch[2]}&hd=2`,
      title,
    };
  }

  if (trimmed.startsWith('/videos/') || /\.(mp4|webm|mov)(\?|$)/i.test(trimmed)) {
    return { kind: 'file', src: trimmed, title };
  }

  return null;
}

export function posterPathForVideo(publicPath: string): string {
  if (!publicPath.startsWith('/videos/')) return '';
  return publicPath.replace(/\.(mp4|webm|mov)$/i, '-poster.jpg');
}

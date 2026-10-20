import { parseVideoUrl, posterPathForVideo } from '@/lib/videoEmbed';

type Props = {
  url: string;
  title?: string;
  className?: string;
};

export default function VideoEmbed({ url, title = 'Видео', className = '' }: Props) {
  const embed = parseVideoUrl(url, title);
  if (!embed) return null;

  return (
    <figure className={`my-6 overflow-hidden rounded-DEFAULT border border-border bg-black ${className}`}>
      <div className="aspect-video w-full">
        {embed.kind === 'iframe' ? (
          <iframe
            src={embed.src}
            title={embed.title}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
          />
        ) : (
          <video
            src={embed.src}
            poster={posterPathForVideo(url) || undefined}
            controls
            playsInline
            preload="none"
            className="h-full w-full object-contain"
          >
            Ваш браузер не поддерживает воспроизведение видео.
          </video>
        )}
      </div>
    </figure>
  );
}

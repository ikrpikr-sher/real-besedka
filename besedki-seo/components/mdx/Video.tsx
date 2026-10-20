import VideoEmbed from '@/components/VideoEmbed';

type Props = {
  src: string;
  title?: string;
};

export default function Video({ src, title }: Props) {
  return <VideoEmbed url={src} title={title} />;
}

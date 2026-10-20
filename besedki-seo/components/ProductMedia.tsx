'use client';

import dynamic from 'next/dynamic';
import ImageGallery from '@/components/ImageGallery';

const ProductModelViewer = dynamic(() => import('@/components/ProductModelViewer'), {
  ssr: false,
  loading: () => (
    <div className="flex aspect-[4/3] max-h-[392px] items-center justify-center rounded-DEFAULT border border-border bg-surface text-sm text-text-muted">
      Загружаем 3D…
    </div>
  ),
});

type Props = {
  title: string;
  images: string[];
  model3d?: string;
};

export default function ProductMedia({ title, images, model3d }: Props) {
  const poster = images[0];

  return (
    <div className="mb-6 space-y-6">
      {images.length > 0 ? (
        <ImageGallery images={images} alt={title} />
      ) : (
        <div className="aspect-video rounded-DEFAULT bg-border" aria-hidden />
      )}

      {model3d ? (
        <ProductModelViewer src={model3d} poster={poster} alt={`3D модель — ${title}`} />
      ) : null}
    </div>
  );
}

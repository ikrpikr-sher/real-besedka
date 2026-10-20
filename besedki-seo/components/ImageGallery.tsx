'use client';

import { useCallback, useEffect, useState } from 'react';
import { catalogCardThumbUrl } from '@/lib/catalogCardUrl';

type Props = {
  images: string[];
  alt: string;
};

function withRetryToken(src: string): string {
  const base = src.split('?')[0];
  const params = new URLSearchParams(src.includes('?') ? src.split('?')[1] : '');
  params.set('retry', String(Date.now()));
  return `${base}?${params.toString()}`;
}

function GalleryImage({
  src,
  alt,
  className,
  priority = false,
  thumb = false,
}: {
  src: string;
  alt: string;
  className: string;
  priority?: boolean;
  thumb?: boolean;
}) {
  const preferred = thumb ? catalogCardThumbUrl(src) : src;
  const [currentSrc, setCurrentSrc] = useState(preferred);

  useEffect(() => {
    setCurrentSrc(thumb ? catalogCardThumbUrl(src) : src);
  }, [src, thumb]);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={priority ? 'high' : 'low'}
      onError={() => {
        setCurrentSrc((prev) => {
          if (thumb && prev !== src) return src;
          return prev.includes('retry=') ? prev : withRetryToken(src);
        });
      }}
    />
  );
}

export default function ImageGallery({ images, alt }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const close = useCallback(() => setOpenIndex(null), []);

  const showPrev = useCallback(() => {
    setOpenIndex((index) => (index === null ? null : (index - 1 + images.length) % images.length));
  }, [images.length]);

  const showNext = useCallback(() => {
    setOpenIndex((index) => (index === null ? null : (index + 1) % images.length));
  }, [images.length]);

  useEffect(() => {
    if (openIndex === null) return;

    document.body.style.overflow = 'hidden';

    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') close();
      if (event.key === 'ArrowLeft') showPrev();
      if (event.key === 'ArrowRight') showNext();
    }

    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [openIndex, close, showPrev, showNext]);

  if (images.length === 0) return null;

  return (
    <>
      <div className="mb-6 grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
        {images.map((img, index) => (
          <button
            key={`${index}-${img}`}
            type="button"
            onClick={() => setOpenIndex(index)}
            className="group relative aspect-[4/3] overflow-hidden rounded-DEFAULT bg-border text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label={`Открыть фото ${index + 1} из ${images.length}`}
          >
            <GalleryImage
              src={img}
              alt={`${alt} — фото ${index + 1}`}
              className="h-full w-full cursor-zoom-in object-cover transition-transform duration-200 group-hover:scale-105"
              priority={index === 0}
              thumb={index > 0}
            />
            <span className="pointer-events-none absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
          </button>
        ))}
      </div>

      {openIndex !== null ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-2 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label="Просмотр фото"
          onClick={close}
        >
          <button
            type="button"
            onClick={close}
            className="absolute right-3 top-3 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:right-5 sm:top-5"
            aria-label="Закрыть"
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
              <path
                fill="currentColor"
                d="M18.3 5.71a1 1 0 0 0-1.41 0L12 10.59 7.11 5.7A1 1 0 1 0 5.7 7.11L10.59 12 5.7 16.89a1 1 0 1 0 1.41 1.41L12 13.41l4.89 4.89a1 1 0 0 0 1.41-1.41L13.41 12l4.89-4.89a1 1 0 0 0 0-1.4z"
              />
            </svg>
          </button>

          {images.length > 1 ? (
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  showPrev();
                }}
                className="absolute left-2 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:left-5"
                aria-label="Предыдущее фото"
              >
                <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
                  <path fill="currentColor" d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  showNext();
                }}
                className="absolute right-2 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:right-5"
                aria-label="Следующее фото"
              >
                <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
                  <path fill="currentColor" d="m10 6-1.41 1.41L13.17 12l-4.58 4.59L10 18l6-6z" />
                </svg>
              </button>
            </>
          ) : null}

          <div onClick={(event) => event.stopPropagation()}>
            <GalleryImage
              src={images[openIndex]}
              alt={`${alt} — фото ${openIndex + 1}`}
              className="max-h-[85vh] max-w-full cursor-default object-contain"
              priority
            />
          </div>

          {images.length > 1 ? (
            <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-white/80">
              {openIndex + 1} / {images.length}
            </p>
          ) : null}
        </div>
      ) : null}
    </>
  );
}

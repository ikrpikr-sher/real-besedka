'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import type { ModelViewerElement } from '@google/model-viewer';
import { hideConfiguratorAccessories } from '@/lib/builder/modelVisuals';
import { loadModelViewer } from '@/lib/modelViewerLoader';

type Props = {
  src: string;
  poster?: string;
  alt: string;
  /** Компактный режим для конфигуратора (~50% высоты). */
  compact?: boolean;
};

export default function ProductModelViewer({ src, poster, alt, compact = false }: Props) {
  const viewerRef = useRef<HTMLElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadModelViewer()
      .then(() => {
        if (!cancelled) setReady(true);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setFailed(false);
    const el = viewerRef.current as ModelViewerElement | null;
    if (!el) return;
    const onError = () => setFailed(true);
    const onLoad = () => hideConfiguratorAccessories(el);
    el.addEventListener('error', onError);
    el.addEventListener('load', onLoad);
    if (el.loaded) onLoad();
    return () => {
      el.removeEventListener('error', onError);
      el.removeEventListener('load', onLoad);
    };
  }, [src, ready]);

  const viewerHeight = compact ? 'min(25vh, 196px)' : 'min(50.4vh, 392px)';

  if (failed) {
    return (
      <div
        className={`flex aspect-[4/3] items-center justify-center rounded-DEFAULT border border-border bg-surface p-4 text-center text-sm text-text-muted ${
          compact ? 'max-h-[196px]' : 'max-h-[392px]'
        }`}
      >
        3D-модель для этой позиции скоро появится. Пока смотрите фото.
      </div>
    );
  }

  if (!ready) {
    return (
      <div
        className={`flex aspect-[4/3] items-center justify-center rounded-DEFAULT border border-border bg-surface text-sm text-text-muted ${
          compact ? 'max-h-[196px]' : 'max-h-[392px]'
        }`}
      >
        Загружаем 3D-модель…
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-DEFAULT border border-border bg-white">
      <model-viewer
        ref={viewerRef as never}
        src={src}
        poster={poster}
        alt={alt}
        camera-controls
        touch-action="pan-y"
        auto-rotate
        auto-rotate-delay={2500}
        rotation-per-second="12deg"
        shadow-intensity={0}
        exposure={1.05}
        environment-image="neutral"
        tone-mapping="commerce"
        field-of-view="30deg"
        interaction-prompt="none"
        loading="lazy"
        style={{
          width: '100%',
          height: viewerHeight,
          backgroundColor: 'transparent',
          '--poster-color': 'transparent',
        } as CSSProperties}
      />
      <p
        className={`border-t border-border bg-surface text-center text-text-muted ${
          compact ? 'px-2 py-1.5 text-xs leading-snug' : 'px-3 py-2 text-xs'
        }`}
      >
        Крутите мышью или пальцем · двойной щелчок — сброс ракурса
      </p>
    </div>
  );
}

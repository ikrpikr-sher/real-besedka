import type { DetailedHTMLProps, HTMLAttributes } from 'react';

type ModelViewerAttributes = DetailedHTMLProps<
  HTMLAttributes<HTMLElement> & {
    src?: string;
    poster?: string;
    alt?: string;
    loading?: 'auto' | 'lazy' | 'eager';
    reveal?: 'auto' | 'manual';
    'camera-controls'?: boolean;
    'touch-action'?: string;
    'auto-rotate'?: boolean;
    'auto-rotate-delay'?: number;
    'rotation-per-second'?: string;
    'shadow-intensity'?: number | string;
    exposure?: number | string;
    'environment-image'?: string;
    'tone-mapping'?: string;
    'field-of-view'?: string;
    'skybox-image'?: string;
    ar?: boolean;
    'ar-modes'?: string;
    'interaction-prompt'?: 'auto' | 'when-focused' | 'none';
  },
  HTMLElement
>;

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': ModelViewerAttributes;
    }
  }
}

export {};

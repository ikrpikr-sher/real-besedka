import type { ProductOptionSelection } from '@/lib/productOptions';

export type BuilderFormat = 'open' | 'closed';

export type BuilderWallSide = 'S' | 'N' | 'W' | 'E';

export type BuilderVisualOptions = {
  frameColorId: string;
  hideDecorPanels: boolean;
  format: BuilderFormat;
  walls: BuilderWallSide[];
  curtains: boolean;
  mosquitoNets: boolean;
  lighting: boolean;
};

export type BuilderFormatOption = {
  id: BuilderFormat;
  label: string;
  description: string;
  image: string;
};

export type BuilderPanel = {
  id: string;
  label: string;
  previewImage: string;
  catalogSlug: string;
};

export type BuilderConfig = {
  title: string;
  intro: string;
  formats: BuilderFormatOption[];
  modularSlug: string;
  panels: BuilderPanel[];
  resultCta: { title: string; text: string };
};

export type BuilderStep = 'format' | 'model' | 'panels' | 'extras' | 'summary';

export type BuilderState = {
  format: BuilderFormat | null;
  catalogSlug: string | null;
  panelId: string | null;
  walls: BuilderWallSide[];
  extras: ProductOptionSelection;
};

export type BuilderPreview = {
  title: string;
  subtitle: string;
  images: string[];
  model3d?: string;
  priceFrom: number;
  total: number;
  onRequest: string[];
};

export type CatalogItemLite = {
  slug: string;
  title: string;
  size: string;
  priceFrom: number;
  tagline?: string;
  images: string[];
  model3d?: string;
  configuratorId?: string;
};

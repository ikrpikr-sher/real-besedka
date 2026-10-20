export { getBuilderConfig, getBuilderSteps, stepLabel, defaultBuilderState, stepIndex } from '@/lib/builder/config';
export { getProductModel3dUrlFromSlug } from '@/lib/builder/catalogModels';
export { buildLeadContext, initBuilderExtras, initExtrasForItem, resolvePreview, resolvePreviewItem } from '@/lib/builder/resolve';
export { filterOpenConfiguratorItems, findItemBySize, getOpenSizeOptions, getSizeOptions, sizeOptionLabel } from '@/lib/builder/sizes';
export { buildVisualOptions } from '@/lib/builder/visualOptions';
export type {
  BuilderConfig,
  BuilderFormat,
  BuilderPanel,
  BuilderPreview,
  BuilderState,
  BuilderStep,
  BuilderVisualOptions,
  BuilderWallSide,
  CatalogItemLite,
} from '@/lib/builder/types';
